import { Tabby, Payment as TabbyPaymentData, TabbyCheckoutPayload } from 'tabby-react-native-sdk';


export async function initiateTabbyPayment(orderDetails,language) {
 const  {
    amount,email,phone,name,reference_id,
    city,zip,address
  } = orderDetails
  console.log('the data for intitain tabby app is ',orderDetails)
  const customerPayment: TabbyPaymentData = {
    amount:amount,
    currency: "SAR",
    buyer: {
      email,
      phone,
      name,
    },
    order: {
      reference_id,
    },  
    shipping_address: {
      "city": city,
      "address": address,
      "zip": zip
      },};
  
   const tabbyPayment: TabbyCheckoutPayload = { 
    merchant_code: 'ae', 
    lang: language || 'ar', 
    payment: customerPayment 
  };
  ;

  try {
      const { sessionId, paymentId, availableProducts } = await Tabby.createSession(tabbyPayment);

      console.log('the result ,webUrl',availableProducts,sessionId)
      return {
        webUrl: availableProducts[0]?.webUrl,
        sessionId
      
      }
  } catch (error) {
      console.error('Failed to create Tabby session', error);
      throw error;
  }
}