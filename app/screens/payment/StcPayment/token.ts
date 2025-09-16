import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {EXPO_PUBLIC_STC_API_BASE_URL,EXPO_PUBLIC_STCPAY_CLIENTID,EXPO_PUBLIC_STCPAY_CLIENTSECRET} from '@env';

export const TOKEN_STORAGE_KEY = 'stcPayAccessToken';

async function getAccessToken() {
  try {
    const storedTokenData = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedTokenData) {
      const parsedTokenData = JSON.parse(storedTokenData);
      if (Date.now() < parsedTokenData.expires_at) {
        return parsedTokenData;
      }
    }

    const url = `${EXPO_PUBLIC_STC_API_BASE_URL}stcpayout-nativeoauth/oauth2/token`;
    
    const clientId = EXPO_PUBLIC_STCPAY_CLIENTID;
    const clientSecret = EXPO_PUBLIC_STCPAY_CLIENTSECRET;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
    };

    const data = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'B2B-FullAccess'
    }).toString();

    const response = await axios.post(url, data, { headers });

    const tokenData = {
      ...response.data,
      expires_at: Date.now() + (response.data.expires_in * 1000)
    };

    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
    return tokenData;

  } catch (error) {
    console.error('Error getting/storing access token:', error);
    throw error;
  }
}

export { getAccessToken };