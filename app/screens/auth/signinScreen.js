import React, { useState, useCallback, memo, useRef, useMemo } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as Linking from 'expo-linking';
import { useTranslation } from "react-i18next";
import { RFPercentage } from 'react-native-responsive-fontsize';
import tw from 'twrnc';

import AppText from "../../component/AppText";
import AppButton from "../../component/AppButton";
import PhoneNumberTextField from "../../component/PhoneInput";
import LoadingModal from "../../component/Loading";
import { Colors, Fonts, Sizes } from "../../constant/styles";
import Logo from "../../component/Logo";
import LanguageDropDownMenuSelect from "../language/LanguageDropDownMenuSelect";

const { width, height } = Dimensions.get('screen');

const SigninScreen = ({ navigation }) => {
  const [disabled, setDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState({ phoneNumber: null });
  const { t } = useTranslation();
  const { phoneNumber } = state;

  const updateState = useCallback((data) => {
    setState((state) => ({ ...state, ...data }));
    const { phoneNumber } = { ...state, ...data };
    if (phoneNumber?.length === state?.length - 1) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [state?.length]);

  const convertPhoneTovalid = (phone) => {
    const phoneNumberWithoutPlus = phone?.replace("+", "");
    const phoneNumber = Number(phoneNumberWithoutPlus);
    return phoneNumber;
  };

  const handleSendVerificationCode = useCallback(async () => {
    try {
      setDisabled(true);
      setIsLoading(true);
      
      const phoneNumberValidToSend = `${state.countryCode}${state.phoneNumber}`;
      const validPhone = `${phoneNumberValidToSend.replace(/\s/g, "").trim()}`;
      const PhoneNumberValidated = convertPhoneTovalid(validPhone);
      

      
      const response = await fetch('https://njik.sa/otp-system/send-otp4.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: validPhone,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      // التحقق من حالة النجاح بناءً على statusCode
      if (data.statusCode === 201 || data.statusCode === 200) {
        navigation.navigate("Verification", {
          phoneNumber: PhoneNumberValidated,
          fullPhoneNumber: validPhone,
          handleSendVerificationCode,
        });
      } else {
        Alert.alert(
          t("Something Went Wrong"),
          data.message || t("Please try again!"),
          [{ text: t('Ok') }]
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert(
        t("Something Went Wrong, Please try again!"),
        "",
        [{ text: t('Ok') }]
      );
    } finally {
      setDisabled(false);
      setIsLoading(false);
    }
  }, [state, navigation]);

  const handlePrivacyLink = () => {
    Linking.openURL('https://njik.com.sa/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <LanguageDropDownMenuSelect />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Logo />
        </View>
        <View style={styles.centeredView}>
          <AppText
            centered={true}
            text={"Signin with Phone Number"}
            style={styles.headerText}
          />
        </View>
        <PhoneNumberTextField
          phoneNumber={phoneNumber}
          updateState={updateState}
        />
        <AppButton
          path={"Verification"}
          title={"Continue"}
          disabled={disabled}
          style={[styles.lowerText, { marginTop: 30 }]}
          textStyle={{ fontSize: RFPercentage(2.3) }}
          onPress={handleSendVerificationCode}
        />
        <View style={styles.centeredView}>
          <AppText
            text={"We'll send OTP for Verification"}
            style={styles.VerificationText}
          />
        </View>
        <View style={styles.linkContainer}>
          <AppText 
            text={'When you enter your mobile number and continue, you agree to'}
            style={[
              { fontSize: RFPercentage(1.8), textAlign: 'center' },
              tw`text-slate-500 text-md mb-4 flex-wrap`
            ]}
          />
          <TouchableOpacity onPress={handlePrivacyLink}>
            <AppText
              text={"Privacy"}
              style={[{
                fontSize: RFPercentage(2.1),
                color: Colors.primaryColor
              }]}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LoadingModal visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor
  },
  logoContainer: {
    marginTop: 80,
    marginBottom: 20,
    marginHorizontal: 50,
  },
  centeredView: {
    flex: 1,
    alignItems: "center"
  },
  linkContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: height * 0.1
  },
  headerText: { 
    marginBottom: width * 0.05, 
    color: Colors.primaryColor, 
    fontSize: RFPercentage(1.95), 
    textAlign: 'center' 
  },
  lowerText: { 
    paddingHorizontal: width * 0.3, 
    alignSelf: 'center' 
  },
  VerificationText: {
    marginTop: 25,
    ...Fonts.grayColor18Medium,
    fontSize: RFPercentage(2.3)
  }
});

export default memo(SigninScreen);