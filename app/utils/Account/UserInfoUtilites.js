import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../../firebaseConfig";
import { Alert } from "react-native";
import * as Linking from 'expo-linking'

const handleSignOut = async () => {
  try {
    await auth.signOut();
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.log(error);
  }
};

const ChangeAccountStatusToInactive = async (userData) => {
  try {

    await handleSignOut();

    Linking.openURL("https://njik.com.sa/%D8%A7%D8%AA%D8%B5%D9%84-%D8%A8%D9%86%D8%A7/");
  } catch (error) {
    console.log("error deactivating the account ", error);
  }
};

export const HandleDeleteAcount = (currentOrders, userData, t) => {
  Alert.alert(
    t('Delete Account'),
    t('Are you sure you want to delete your account? This action cannot be undone.'),
    [
      { text: t('Cancle'), onPress: () => {}, style: 'cancel' },
      {
        text: t('Confirm'),
        onPress: () => {
          if (currentOrders?.length > 0) {
            Alert.alert(
              t('Delete Account'),
              "يرجى إكمال طلباتك الحالية لتتمكن من حذف حسابك",
              [{ text: t('Ok'), onPress: () => {}, style: 'cancel' }]
            );
          } else {
            ChangeAccountStatusToInactive(userData);
          }
        },
      },
    ],
    { cancelable: false }
  );
};
