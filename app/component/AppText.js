import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Dimensions, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import ar from "../locales/ar.json";
import { Text } from "react-native";
import { Fonts, mainFont } from "../constant/styles";
import { I18nManager } from "react-native";
import en from "../locales/en.json";

import 'intl-pluralrules';
import { memo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
I18nManager.forceRTL(false);
AsyncStorage.getItem('language').then((e)=>{
  i18n.use(initReactI18next).init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: e || "ar", // Set the default language to Arabic
    fallbackLng: 'ar', // Fallback language if a translation is missing
    interpolation: {
      escapeValue: false,
    },
  });
})
const { width } = Dimensions.get('screen')
 function AppText({ style, text, centered = true ,...otherProps}) {
  const { t } = useTranslation();

  return (
      <Text
      
        style={[
          styles.text,
          { alignSelf: centered ? "center" : "flex-start" },
          style,
        ]}
        {...otherProps}
      >
        {t(text)}
      </Text>
  );
}
export default memo(AppText)
const styles = StyleSheet.create({
  text: {
    ...Fonts.grayColor18Medium,
    fontFamily: mainFont.bold,
    maxWidth: width*0.74,
    writingDirection:'rtl',
    alignSelf:'flex-start'
  },
});