import React from "react";
import { Modal, View, Text, Dimensions, StyleSheet, Platform } from "react-native";
import LottieView from "lottie-react-native";
import AppButton from "./AppButton";
import { Colors } from "../constant/styles";

const { width } = Dimensions.get("screen");

export default function SuccessModal({ visible, onClose, navigation }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      hardwareAccelerated
      statusBarTranslucent
      // ❌ لا تضيف onRequestClose أبداً، لأنه يخلي المودال يختفي من نفسه
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <LottieView
            autoPlay
            loop={false}
            style={{ width: 180, height: 180 }}
            source={require("../assets/success.json")}
          />
          <Text style={styles.text}>تم الدفع بنجاح ✅</Text>

          {/* زر الرجوع */}
          <AppButton
            title={"رجوع"}
            onPress={() => {
              onClose(); // يخفي المودال
              if (navigation) navigation.goBack(); // لو تبغى يرجع بعد الزر
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: 20,
    width: width - 80,
    alignItems: "center",
    paddingVertical: 30,
  },
  text: {
    fontSize: 18,
    color: Colors.stcprimaryColor,
    marginVertical: 10,
    fontWeight: "bold",
  },
});
