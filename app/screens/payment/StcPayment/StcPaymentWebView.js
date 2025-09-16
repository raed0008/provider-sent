
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, Dimensions, Image, TouchableOpacity, Keyboard } from "react-native";
import AppText from "../../../component/AppText";
import AppButton from "../../../component/AppButton";
import ArrowBack from "../../../component/ArrowBack";
import { handleConfirmPayment } from "./StcHelpers";
import { Ionicons } from "@expo/vector-icons";
import { paymentInquiry } from "./apiServices";
import { GetOrderData, updateOrderData } from "../../../../utils/orders";
import { useDispatch, useSelector } from "react-redux";
// import * as Haptics from "expo-haptics";
import useNotifications from "../../../../utils/notifications";
import { HandleProviderProfitAfterSuccessPayment, HandleUserBalanceAfterOperation } from "../../payment/tabby/Tabbyhelpers";
import { useTranslation } from "react-i18next";
// import { useDarkMode } from "../../../context/DarkModeContext";
import { Colors } from "../../../constant/styles";
import LoadingModal from "../../../component/Loading";
import SuccessModal from "../../../component/SuccessModal";
import FailModal from "../../../component/FailModal";

const { height } = Dimensions.get("screen");

const StcPayment = ({ route, navigation }) => {
  const {
    OtpReference,
    STCPayPmtReference,
    RefNum,
    BillNumber,
    handlePayOrderFun,
    orderId,
    decreadedAmountFromWallet = 0,
    amount,
  } = route?.params || {};

  const [OtpValue, setOtpValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.userData);
  const { sendPushNotification } = useNotifications();
  const { t, i18n } = useTranslation();
  // const { isDarkMode } = useDarkMode();
  console.log("✅ StcPayment route params:", route?.params);


  // 👇 هنا تحط الـ useEffect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString(undefined, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // every minute

    return () => clearInterval(interval); // cleanup
  }, []);

  const handleSuccesFunction = async () => {
    try {
      await updateOrderData(orderId, { payment_brand: "stcpay" });
      HandleUserBalanceAfterOperation(orderId, decreadedAmountFromWallet, user, dispatch);
      HandleProviderProfitAfterSuccessPayment(null, sendPushNotification);
      handlePayOrderFun();
    } catch (e) {
      console.log("Error handling success:", e);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };


  return (
    <View style={{ flex: 1, backgroundColor: Colors.whiteColor, paddingHorizontal: 20 }}>
      {/* modals */}
      <LoadingModal visible={isLoading} />
      <SuccessModal visible={showSuccess} onClose={() => {
        setShowSuccess(false);
        navigation.goBack();
      }} />
      <FailModal visible={showFail} onClose={() => setShowFail(false)} />

      {/* back button */}
      <View style={{ marginTop: 50, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            padding: 5,
            backgroundColor: "transparent",
            borderRadius: 10,
            alignSelf: "flex-start",
          }}
        >
          <Ionicons name="arrow-forward" size={25} color={Colors.stcprimaryColor} />
        </TouchableOpacity>
      </View>

      {/* stc logo */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={require("../../../assets/images/payment_icon/stc.png")}
          style={{ width: 200, height: 80, resizeMode: "contain" }}
        />
      </View>

      {/* title */}
      <AppText text={t("Verify OTP number")} style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 }} />
      <AppText text={t("Enter the OTP sent to")} style={{ textAlign: "center", color: Colors.grayColor, marginBottom: 20 }} />

      {/* card */}
      <View
        style={{
          borderWidth: 1,
          borderColor: Colors.grayColor,
          borderRadius: 12,
          padding: 15,
          marginBottom: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* left */}
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ fontWeight: "bold", color: Colors.stcsecondColor }}>{t("STC Bank")}</Text>
          <Text style={{ color: Colors.grayColor, fontSize: 12 }}>
            {t("Today at")} {currentTime}
          </Text>
        </View>

        {/* right */}
        <Text style={{ fontWeight: "bold" }}>
          {amount ? Number(amount).toFixed(2) : "0.00"} {t("SAR")}
        </Text>
      </View>

      {/* otp input */}
      <Text style={{ fontWeight: "bold", marginBottom: 8, textAlign: i18n.dir() === "rtl" ? "left" : "right", writingDirection: i18n.dir() }}>{t("Enter your code below")}</Text>
      <TextInput
        value={OtpValue}
        onChangeText={(text) => {
          setOtpValue(text);
          if (text.length === 4) {
            Keyboard.dismiss();
          }
        }}
        keyboardType="numeric"
        maxLength={4}
        style={{
          borderWidth: 1,
          borderColor: error ? "red" : Colors.stcprimaryColor,
          borderRadius: 8,
          padding: 12,
          textAlign: "center",
          fontSize: 18,
          marginBottom: 5,
          color: Colors.stcprimaryColor,
          letterSpacing: 12,
        }}
        placeholder="0000"
        placeholderTextColor="rgba(0,0,0,0.2)"
        selectionColor={Colors.stcsecondColor}
        cursorColor={Colors.stcsecondColor}
      />
      {error ? <Text style={{ color: "red", marginBottom: 10, textAlign: i18n.dir() === "rtl" ? "left" : "right", writingDirection: i18n.dir() }}>{t("Invalid OTP")}</Text> : null}

      {/* resend */}
      {/* <AppText
        style={{ color: Colors.stcsecondColor, marginBottom: 20, textAlign: "center", fontSize: 16 }}
        text={t("Resend code")}
      /> */}

      {/* confirm button */}
      <TouchableOpacity
        style={{
          backgroundColor: Colors.stcprimaryColor,
          borderRadius: 10,
          paddingVertical: 15,
          width: "50%",
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 50,
        }}
        onPress={async () => {
          // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          if (!OtpValue && !FORCE_PAYMENT_SUCCESS) {
            setError(t("Invalid OTP"));
            return;
          }

          setIsLoading(true);
          try {
            const res = await handleConfirmPayment(
              OtpReference,
              OtpValue,
              STCPayPmtReference,
              t
            );

            setIsLoading(false);

            if (res && res.ApprovalStatus === 2) {
              setError("");
              handleSuccesFunction();

              if (route?.params?.fromPayment) {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: "SUCESS_PAYMENT_SCREEN",
                      params: {
                        orderId,
                        item: route?.params?.item,
                        firstReview: true,
                      },
                    },
                  ],
                });
              } else {
                setShowSuccess(true);
              }
            }
            else {
              setError("Invalid OTP");
              setShowFail(true);
            }
          } catch (e) {
            console.log("❌ Payment error:", e);
            setIsLoading(false);
            setShowFail(true);
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          {t("Confirm")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default StcPayment;