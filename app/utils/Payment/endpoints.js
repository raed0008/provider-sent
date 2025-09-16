import axios from 'axios';
import {EXPO_PUBLIC_PAYMENT_ENDPOINT } from '@env'
const checkPaymentStatus = async (orderId, merchantId, paymentId, hash) => {
 const url = `${EXPO_PUBLIC_PAYMENT_ENDPOINT}/status`;
 const data = {
    order_id: orderId,
    merchant_id: merchantId,
    gway_Payment_id: paymentId,
    hash: hash,
 };

 try {
    const response = await axios.post(url, data);
    return response.data;
 } catch (error) {
    console.error(error);
    return null;
 }
};
const processRefund = async (gwayId, orderId, merchantId, hash, payerIp, amount) => {
    const url = `${EXPO_PUBLIC_PAYMENT_ENDPOINT}/refund`;
    const data = {
       gwayId: gwayId,
       order_id: orderId,
       edfa_merchant_id: merchantId,
       hash: hash,
       payer_ip: payerIp,
       amount: amount,
    };
   
    try {
       const response = await axios.post(url, data);
       return response.data;
    } catch (error) {
       console.error(error);
       return null;
    }
   };
   