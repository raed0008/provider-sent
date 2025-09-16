import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { memo } from "react";
import { StyleSheet } from "react-native";
import AppText from "./AppText";
import { Colors, Sizes, Fonts } from "../constant/styles";

function AppButton({
  path,
  title,
  style,
  textStyle,
  onPress,
  disabled = false,
}) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.continueButtonStyle,
        style,
        disabled ? styles.disabledStyle : {},
      ]}
    >
      <AppText
        text={title}
        style={{
          ...Fonts.whiteColor19Medium,
          ...textStyle,
          color: disabled ? Colors.blackColor : Colors.whiteColor,
        }}
      />
    </TouchableOpacity>

  );
}
export default memo(AppButton)
const styles = StyleSheet.create({
  continueButtonStyle: {
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    paddingVertical: Sizes.fixPadding,
    marginHorizontal: Sizes.fixPadding,
    borderRadius: Sizes.fixPadding - 5.0,
    marginTop: Sizes.fixPadding * 1.0,
    paddingHorizontal: Sizes.fixPadding * 2.5,
    borderRadius: 40,
    backgroundColor: Colors.primaryColor,
  },
  disabledStyle: {
    backgroundColor: Colors.grayColor,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    paddingVertical: Sizes.fixPadding,
    marginHorizontal: Sizes.fixPadding,
    borderRadius: Sizes.fixPadding - 5.0,
    marginTop: Sizes.fixPadding * 4.0,
    paddingHorizontal: Sizes.fixPadding * 2.5,
    borderRadius: 40,
  },
});
