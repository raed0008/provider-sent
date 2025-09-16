import axios from 'axios';
import { EXPO_PUBLIC_STC_API_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';

const endpoints = {
  directPaymentAuthorize: 'authorize',
  directPaymentConfirm: 'confirm',
  paymentInquiry: 'inquiry',
};

// Create a generic request function
const makeRequest = async (endpoint, data) => {
  try {
    console.log("🔎 BASE_URL:", EXPO_PUBLIC_STC_API_BASE_URL);
    const fullUrl = `${EXPO_PUBLIC_STC_API_BASE_URL}?action=${endpoint}`;
    console.log("🔎 Final URL:", fullUrl);

    console.log('\n📤 STC REQUEST');
    console.log('➡️ URL:', fullUrl);
    console.log('📦 BODY:', JSON.stringify(data, null, 2));

    const response = await axios.post(fullUrl, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API response error:', error.response.data);
      Toast.show({
        type: 'error',
        text2: error.response.data?.message || "STC API error",
        swipeable: true,
      });
      throw error;
    } else if (error.request) {
      console.error('API request error:', error.request);
      throw error;
    } else {
      console.error('API setup error:', error.message);
      throw error;
    }
  }
};

// Export functions for each endpoint
export const directPaymentAuthorize = (data) => makeRequest(endpoints.directPaymentAuthorize, data);
export const directPaymentConfirm = (data) => makeRequest(endpoints.directPaymentConfirm, data);
export const paymentInquiry = (data) => makeRequest(endpoints.paymentInquiry, data);