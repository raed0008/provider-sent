import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import AppButton from "../../../component/AppButton";
import { Colors } from "../../../constant/styles";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("screen");

export default function StcPaymentSuccess({ navigation, route }) {
  const { t } = useTranslation();
  const { handlePayOrderFun, amount } = route?.params || {};
  const user = useSelector((state) => state.user.userData);

  const handleReturn = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t("wallet_recharge_title"),
          body: t("wallet_recharge_body", {
            amount: Number(amount).toFixed(2),
          }),
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      navigation.navigate(t("Account"), { screen: "wallet" });

      if (handlePayOrderFun) handlePayOrderFun();
    } catch (e) {
      console.log("❌ خطأ أثناء إرسال الإشعار:", e);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <LottieView
          autoPlay
          loop={false}
          style={{ width: 180, height: 180 }}
          source={require("../../../assets/success.json")}
        />
        <Text style={styles.text}>{t("Payment completed successfully")}</Text>

        <AppButton
          title={t("Continue")}
          onPress={handleReturn}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 20,
    width: width - 80,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 18,
    color: Colors.stcprimaryColor,
    marginVertical: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    width: "80%",
  },
});
