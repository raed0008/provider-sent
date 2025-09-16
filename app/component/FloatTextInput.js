import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { Colors, Sizes, Fonts } from "../constant/styles";

export default function FloatTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  style,
  ...otherProps
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={'#CECECE'}
        style={[styles.input, style]}
        cursorColor={Colors.primaryColor}
        selectionColor={Colors.primaryColor}
        {...otherProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  label: {
    ...Fonts.blackColor15Medium,
    color: Colors.primaryColor,
    marginBottom: 6,
    marginLeft: Sizes.fixPadding,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: Colors.grayColor,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.whiteColor,
    fontSize: 15,
    ...Fonts.blackColor16Regular,
  },
});
