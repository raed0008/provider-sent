import React, { useEffect, useState, memo, useMemo } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useDispatch } from "react-redux";
import { CommonActions } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import { RFPercentage } from 'react-native-responsive-fontsize';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors } from "../../constant/styles";
import ArrowBack from "../../component/ArrowBack";
import AppButton from "../../component/AppButton";
import AppText from "../../component/AppText";
import LoadingModal from "../../component/Loading";
import OtpFields from "../../component/OtpFields";
import { setUserData, userRegisterSuccess } from "../../store/features/userSlice";
import { getUserByPhoneNumber } from "../../../utils/user";
import { INACTIVEACCOUNTSCREEN, ORDER_SUCCESS_SCREEN, REGISTER_ERROR_DOCS } from "../../navigation/routes";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("screen");

const VerificationScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [resendDisabled, setResendDisabled] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { phoneNumber, fullPhoneNumber, handleSendVerificationCode } = route.params;

  const convertPhoneTovalid = (phone) => {
    const phoneNumberWithoutPlus = phone?.replace("+", "");
    const phoneNumber = Number(phoneNumberWithoutPlus);
    return phoneNumber;
  };

  const verifyOtp = async () => {
    if (otpInput.length !== 4) return;

    setIsLoading(true);

    try {
      // طباعة قيم التحقق للـ debug
      console.log("=== DEBUG INFO ===");
      console.log("phoneNumber:", phoneNumber);
      console.log("fullPhoneNumber:", fullPhoneNumber);

      // المسار العادي - الاتصال بالخادم للأرقام الحقيقية
      const response = await fetch('https://njik.sa/otp-system/verify-otp4.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhoneNumber,
          otp: otpInput
        }),
      });

      const data = await response.json();
      console.log("Verification API Response:", data);

      // التحقق من حالة النجاح بناءً على statusCode
      if (data.statusCode === 200) {
        setResendDisabled(true);
        setSecondsRemaining(30);

        // التحقق من المستخدم الموجود بطرق متعددة
        console.log("Checking for existing user...");

        let existingUser = await getUserByPhoneNumber(phoneNumber);
        console.log("Search by phoneNumber result:", existingUser);
        console.log("Type of existingUser:", typeof existingUser);
        console.log("Is array:", Array.isArray(existingUser));

        // إذا لم نجد نتيجة، جرب البحث بالرقم الكامل
        if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) {
          const fullPhoneNumberConverted = convertPhoneTovalid(fullPhoneNumber);
          console.log("Trying with fullPhoneNumberConverted:", fullPhoneNumberConverted);
          existingUser = await getUserByPhoneNumber(fullPhoneNumberConverted);
          console.log("Search by fullPhoneNumber result:", existingUser);
        }

        // التحقق من وجود المستخدم - يدعم كلاً من Object و Array
        const userExists = existingUser && (
          existingUser.id || // إذا كان object واحد
          (Array.isArray(existingUser) && existingUser.length > 0) // إذا كان array
        );

        if (userExists) {
          // الحصول على بيانات المستخدم الصحيحة
          const userData = Array.isArray(existingUser) ? existingUser[0] : existingUser;
          console.log("User found! User data:", userData);

          // المستخدم موجود - تسجيل دخول
          dispatch(setUserData(userData));

          const user = {
            phoneNumber: fullPhoneNumber,
            uid: userData.uid || userData.id || data.user_id || phoneNumber.toString(),
          };

          dispatch(userRegisterSuccess(user));
          await AsyncStorage.setItem("userData", JSON.stringify(user));

          // التحقق من حالة الحساب
          if (userData?.account_status === 'inactive') {
            console.log("Account is inactive, redirecting to inactive screen");
            return navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: INACTIVEACCOUNTSCREEN }],
              })
            );
          }

          console.log("User found and active, redirecting to App");
          // الانتقال إلى التطبيق الرئيسي
          return navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "App" }],
            })
          );
        } else {
          console.log("User not found, redirecting to Register");

          // المستخدم غير موجود - تسجيل جديد
          const user = {
            phoneNumber: fullPhoneNumber,
            uid: data.user_id || phoneNumber.toString(),
          };

          dispatch(userRegisterSuccess(user));
          await AsyncStorage.setItem("userData", JSON.stringify(user));

          // الانتقال إلى شاشة التسجيل
          return navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "Register",
                  params: { phoneNumber: phoneNumber },
                },
              ],
            })
          );
        }
      } else {
        // Handle verification failure
        setOtpInput("");
        Toast.show({
          type: 'error',
          text2: data.message || t('Invalid verification code'),
          swipeable: true
        });
      }
    } catch (error) {
      console.log("Error from verification screen:", error);
      setOtpInput("");
      Toast.show({
        type: 'error',
        text2: t('Something went wrong. Please try again'),
        swipeable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resendDisabled) {
      const timer = setInterval(() => {
        if (secondsRemaining > 0) {
          setSecondsRemaining(secondsRemaining - 1);
        } else {
          setResendDisabled(false); // Enable the "Resend SMS" button
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendDisabled, secondsRemaining]);

  useEffect(() => {
    if (otpInput.length === 4) {
      verifyOtp();
    }
  }, [otpInput]);

  const formattedPhoneNumber = useMemo(() => {
    return fullPhoneNumber ? `${fullPhoneNumber}` : `+${phoneNumber}`;
  }, [phoneNumber, fullPhoneNumber]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <ArrowBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.textContainer}>
            <AppText
              text={"verification"}
              style={{
                fontSize: RFPercentage(3.2),
                color: Colors.primaryColor,
                marginVertical: 17,
              }}
              centered={true}
            />
            <View style={styles.phoneContainer}>
              <AppText
                text={`OTP Code Was Sent To`}
                style={{ fontSize: RFPercentage(2.1) }}
              />
              <AppText
                text={formattedPhoneNumber}
                style={{
                  fontSize: RFPercentage(2.2),
                  color: Colors.primaryColor,
                  writingDirection: 'ltr'
                }}
              />
            </View>
          </View>
          <OtpFields
            setIsLoading={setIsLoading}
            setOtpInput={setOtpInput}
            otpInput={otpInput}
            confirmVerificationCode={verifyOtp}
          />
          <AppButton
            title={"Continue"}
            path={"Register"}
            disabled={otpInput.length !== 4}
            style={[{
              paddingHorizontal: width * 0.35,
              paddingVertical: height * 0.012,
              alignSelf: "center",
            }, otpInput.length == 4 && { marginTop: 40 }]}
            textStyle={{ fontSize: RFPercentage(2.5) }}
            onPress={verifyOtp}
          />
          <View style={styles.sendMessasesContainer}>
            <AppText
              text={"didntReceiveOTP"}
              style={{
                fontSize: RFPercentage(2.4),
                paddingTop: 44,
              }}
              centered={true}
            />
            <AppButton
              title={
                resendDisabled
                  ? ` 00 :${secondsRemaining} `
                  : "Resend"
              }
              textStyle={{ fontSize: RFPercentage(1.9) }}
              disabled={resendDisabled}
              style={{ marginTop: 40 }}
              onPress={() => {
                setResendDisabled(true);
                setSecondsRemaining(30);
                handleSendVerificationCode();
              }}
            />
          </View>
        </View>
      </ScrollView>
      <LoadingModal visible={isLoading} />
      <Toast />
    </View>
  );
};

export default memo(VerificationScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-start",
    marginTop: 10,
    marginVertical: 20,
    paddingHorizontal: 25,
  },
  phoneContainer: {
    flexDirection: "row",
    width: width,
    gap: 8,
  },
  sendMessasesContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 15
  },
});