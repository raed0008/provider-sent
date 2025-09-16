import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet, Modal, Platform } from "react-native";
import AppText from '../component/AppText';
export default function ForceUpdateModal({ visible }) {
  const handleUpdate = () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/id6498963738"
        : "https://play.google.com/store/apps/details?id=com.njik.nijkProvider";

    Linking.openURL(url);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <AppText style={styles.title} text={"forceUpdate"} />
          <AppText style={styles.text} text={"You must update the application to the latest version before you can continue using it"} />
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <AppText
             style={styles.buttonText}
             text={"updateNow"}
           />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 10,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#f2652a" },
  text: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#333" },
  button: {
    backgroundColor: "#f2652a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
