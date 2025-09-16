import React, { useEffect, useRef } from "react";
import { Dimensions, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import AppText from "../component/AppText";
import { StyleSheet } from "react-native";
import { Colors } from "../constant/styles";
import * as Linking from "expo-linking";
import { useLanguageContext } from "../context/LanguageContext";
import { RFPercentage } from "react-native-responsive-fontsize";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserByPhoneNumber } from "../../utils/user";
import * as Updates from "expo-updates";

const { width } = Dimensions.get("screen");

export default function OrderCreationSuccess() {
  const { language } = useLanguageContext();

  const lastStatusRef = useRef(null);
  const lastProviderStatusRef = useRef(null);

  const handleWhatsAppPress = () => {
    let phoneNumber = "+9660592799173";
    let message = "السلام عليكم";
    let encodedMessage = encodeURIComponent(message);
    let url = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
    Linking.openURL(url);
  };

  const refreshStatus = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const userData = JSON.parse(userDataString);
      const phone = userData?.phoneNumber?.replace(/\s/g, "").trim();
      const phoneNumber = Number(phone?.replace("+", ""));

      const gottenuser = await getUserByPhoneNumber(phoneNumber);

      const accountStatus = gottenuser?.attributes?.account_status;
      const providerStatus = gottenuser?.attributes?.Provider_status;

    
      if (
        accountStatus !== lastStatusRef.current ||
        providerStatus !== lastProviderStatusRef.current
      ) {
        console.log("✅ Status changed → Reloading app...");

        lastStatusRef.current = accountStatus;
        lastProviderStatusRef.current = providerStatus;

        await Updates.reloadAsync();
      } else {
        console.log("⏸ No change in status");
      }
    } catch (err) {
      console.log("❌ Error refreshing status:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus();
    }, 100000); // every 100 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "white", alignItems: "center", justifyContent: "center" }}>
      <LottieView
        autoPlay
        style={{ width: 200, height: 200 }}
        source={require("../assets/wait.json")}
      />

      <View style={{ alignItems: "center", marginTop: 50 }}>
        <AppText
          style={[styles.text, { fontSize: RFPercentage(2), maxWidth: width * 0.8 }]}
          text={
            "The request has been received and will be studied and responded to within 24 hours. To follow up on the request, you can contact us on WhatsApp number"
          }
        />
        <TouchableOpacity onPress={handleWhatsAppPress}>
          <AppText
            text={"+9660592799173"}
            style={{
              fontSize: language === "ar" ? RFPercentage(2.2) : RFPercentage(2),
              color: Colors.primaryColor,
              borderWidth: 1,
              borederColor: Colors.grayColor,
              backgroundColor: 'transparent',
              padding: 10,
              overflow: "hidden",
              borderRadius: 20,
              marginTop: 10,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    color: Colors.blackColor,
    textAlign: "center",
  },
});
