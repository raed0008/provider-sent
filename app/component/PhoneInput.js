import React, { memo } from "react";
import IntlPhoneInput from "react-native-intl-phone-input";
import { StyleSheet, I18nManager, Platform } from "react-native";

import { Sizes, Fonts, Colors } from "../constant/styles";
import { useLanguageContext } from "../context/LanguageContext";
import { RFPercentage } from "react-native-responsive-fontsize";

function PhoneNumberTextField({ phoneNumber, updateState }) {
  const { language, direction } = useLanguageContext()
  const MobileDirection = Platform.OS === 'ios' ? 'ltr' : 'rtl'
  return (
    <IntlPhoneInput
      onChangeText={(e) => {
        const countryCode = e.dialCode;
        const length = e.selectedCountry.mask.length;
        updateState({ phoneNumber: e.phoneNumber, countryCode, length });
      }}
      flagStyle={{ display: "none" }}
      defaultCountry="SA"
      disableCountryChange={true}
      containerStyle={{
        borderColor: Colors.primaryColor,
        borderWidth: 1.0,
        borderRadius: Sizes.fixPadding - 5.0,
        marginHorizontal: Sizes.fixPadding,
        flexDirection: I18nManager.isRTL ? "row-reverse" : 'row',
        alignItems: "center",
      }}
      dialCodeTextStyle={styles.dialCodeTextStyle}
      selectionColor={Colors.primaryColor}
      placeholder="5xx xxx xxx"
      phoneInputStyle={styles.phoneInputStyle}

      inputProps={{
        style: {
          textAlign: 'left',
          writingDirection: 'ltr',
        },
      }}
    />
  );
}

export default memo(PhoneNumberTextField)

const styles = StyleSheet.create({
  phoneNumberTextFieldStyle: {
    borderColor: Colors.primaryColor,
    color: Colors.redColor,
    borderWidth: 1.0,
    borderRadius: Sizes.fixPadding - 5.0,
    marginHorizontal: Sizes.fixPadding,
    flexDirection: "row-reverse",
    alignItems: "center", // Align items in the center vertically
    // backgroundColor:'red',

  },
  dialCodeTextStyle: {
    ...Fonts.blackColor17Medium,
    paddingVertical: 5,
    paddingLeft: Sizes.fixPadding - 5.0,
    fontSize: RFPercentage(2),

    color: Colors.primaryColor, textAlign: "left", // Set text alignment to left
    direction: "ltr", // Set text direction to left-to-right (ltr)
  },
  phoneInputStyle: {
    flex: 1,
    paddingRight: Sizes.fixPadding,
    ...Fonts.blackColor17Medium,
    flexDirection: "column",
    fontSize: RFPercentage(2),
    textAlign: "left", // Set text alignment to left
    direction: "ltr", // Set text direction to left-to-right (ltr)
  },
});
