// utils/localStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';


export const saveUserInfo = async (userInfo) => {
  try {
    const jsonValue = JSON.stringify(userInfo);
    await AsyncStorage.setItem('userInfo', jsonValue);
    console.log('User info saved successfully');
  } catch (error) {
    console.error('Error saving user info:', error);
  }
};

export const getUserInfoFromLocal = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('userInfo');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving user info:', error);
    return null;
  }
};
