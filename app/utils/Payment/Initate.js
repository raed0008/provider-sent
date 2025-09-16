import * as Crypto from 'expo-crypto';
import axios  from 'axios';
import {EXPO_PUBLIC_MERCHANT_KEY ,EXPO_PUBLIC_MERCHANT_PASSWORD,EXPO_PUBLIC_PAYMENT_ENDPOINT} from "@env"
import { GetZipCode, getZipCode } from './helpers';
import { Alert } from 'react-native';

async function generateHash(orderDetails, merchantPass) {
    const { orderId, amount, currency, description } = orderDetails;
    const toHash = `${orderId}${amount}${currency}${description}${merchantPass}`;
   
    // First, generate an MD5 hash using a custom function since expo-crypto does not directly support MD5
    const md5Hash = await Crypto.digestStringAsync(
       Crypto.CryptoDigestAlgorithm.MD5,
       toHash.toUpperCase()
    );
   
    // Then, generate a SHA1 hash of the MD5 hash
    const sha1Hash = await Crypto.digestStringAsync(
       Crypto.CryptoDigestAlgorithm.SHA1,
       md5Hash
    );
   console.log("chat sha1Hashsha1Hash",sha1Hash,)
    return sha1Hash;
   }
async function initiatePayment(orderDetails) {
 const paymentUrl = `${EXPO_PUBLIC_PAYMENT_ENDPOINT}/initiate`;
 const formData = new FormData();
 formData.append('action', 'SALE');
 formData.append('edfa_merchant_id', EXPO_PUBLIC_MERCHANT_KEY); // Replace with your actual merchant ID
 formData.append('order_id', orderDetails.orderId);
 formData.append('order_amount', orderDetails.amount);
 formData.append('order_currency', orderDetails.currency);
 formData.append('order_description', orderDetails.description);
 formData.append('payer_first_name', orderDetails.payerFirstName);
 formData.append('payer_last_name', orderDetails.payerLastName || "user");
 formData.append('payer_address', orderDetails.payerAddress || "NOT PROVIDED");
 formData.append('payer_country', orderDetails.payerCountry || "UNKNOWN");
 formData.append('payer_city',orderDetails.payerCity || "UNKOWN");
 formData.append('payer_email', orderDetails.payerEmail || "UNKOWN");
 formData.append('payer_phone', orderDetails.payerPhone || "UNKNOW");
 formData.append('term_url_3ds', "https://njik.sa/"); 
 formData.append("merchant_success_url","?success")
 formData.append( "merchant_failure_url", "?status=failure")
 formData.append('auth', 'N');
 formData.append('req_token', 'N');
 formData.append('recurring_init', 'N');
 const payerIp = await fetchUserIP();
 const zipcode = await getZipCode()

 if (payerIp) {
    formData.append('payer_ip', payerIp || "UNKOWN");
    formData.append('payer_zip', zipcode || "UNKOWN");
    console.log("the ip is ",payerIp,zipcode)
 } else {
    console.error("Failed to fetch IP address");
    // Handle the error appropriately, e.g., throw an error or return
    throw new Error("Failed to fetch IP address");
 }
 // Generate the hash
 const hash = await generateHash(orderDetails, EXPO_PUBLIC_MERCHANT_PASSWORD);
 formData.append('hash', hash);

 const config = {
    method: 'post',
    url: paymentUrl,
    headers: {
        'Content-Type': 'multipart/form-data', 
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      //   "Host":"https://192.168.1.7.com/"
    },
    data: formData,
    maxBodyLength: Infinity,
 };
 const formDataObject = {
   action: 'SALE',
   edfa_merchant_id: EXPO_PUBLIC_MERCHANT_KEY, // Replace with your actual merchant ID
   order_id: orderDetails.orderId,
   order_amount: orderDetails.amount,
   order_currency: orderDetails.currency,
   order_description: orderDetails.description,
   payer_first_name: orderDetails.payerFirstName,
   payer_last_name: orderDetails.payerLastName ,
   payer_address: orderDetails.payerAddress,
   payer_country: orderDetails.payerCountry,
   payer_city: orderDetails.payerCity,
   payer_email: orderDetails.payerEmail,
   payer_phone: orderDetails.payerPhone,
   term_url_3ds: "https://njik.sa/",
   merchant_success_url: "?success",
   merchant_failure_url: "?status=failure",
   req_token: 'Y',
   recurring_init: 'N',
   payer_ip:payerIp,
   payer_zip:zipcode,
   hash:hash
  };
  console.log("form data is ",formDataObject)
 try {
    const response = await axios(config);
    console.log(JSON.stringify(response.data));
    return response.data;
 } catch (error) {
   console.error('Error initiating payment:', error.message);
   // Check if the error contains a response from the server
   if (error.response) {
       // The server responded with a status code that falls out of the range of 2xx
      //  console.error('Server responded with an error:', error.response.data);
       // Display the error message from the server along with the config data
       Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);
       //  Alert.alert("Error initiating payment",`${ JSON.stringify(error.response.data)} ${JSON.stringify(config?.data)}`, [{ text: "OK", }]);
   } else if (error.request) {
       // The request was made but no response was received
       console.error('No response received:', error.request);
       Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);

      //  Alert.alert("Error initiating payment", "No response received from the server", [{ text: "OK", }]);
      //  console.log("Request config:", config); // Log the config for debugging
   } else {
       // Something happened in setting up the request that triggered an Error
       console.error('Error', error.message);
       Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);

      //  Alert.alert("Error initiating payment", error.message, [{ text: "OK", }]);
      //  console.log("Request config:", config); // Log the config for debugging
   }
   throw error;
}

}
async function fetchUserIP() {
   try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data?.ip;
   } catch (error) {
      console.error('Error fetching IP:', error);
      return null; // Return null if there's an error
   }
  }
 export  const checkOrderStatus = async (orderID) => {
   const url = `${EXPO_PUBLIC_PAYMENT_ENDPOINT}/status`;
   const data = {
       order_id: orderID,
       merchant_id: EXPO_PUBLIC_MERCHANT_KEY
   };

   try {
       const response = await fetch(url, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               // Add any other necessary headers here
           },
           body: JSON.stringify(data),
       });

       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }

       const responseData = await response.json();
       console.log("the cucfrent redpon ", responseData);
       return responseData;
   } catch (error) {
      throw error; // Rethrow the error if you want to handle it in the calling code
   }
};

// Example usage


 export default initiatePayment


