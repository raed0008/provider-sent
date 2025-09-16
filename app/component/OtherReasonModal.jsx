import React from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constant/styles";
import { useTranslation } from "react-i18next";

export default function OtherReasonModal({
  visible,
  onClose,
  onConfirm,
  value,
  setValue,
  price,
  setPrice,
}) {
  const [isSelected, setIsSelected] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  const handleConfirmPress = () => {
    if (cooldown || loading) return;

    setLoading(true);
    onConfirm();
    setTimeout(() => {
      setLoading(false);
      setCooldown(false);
    }, 3000);

    setCooldown(true);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("enter_reason_title")}</Text>

          <TextInput
            style={styles.input}
            placeholder={t("enter_reason_placeholder")}
            value={value}
            onChangeText={setValue}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.back]}
              onPress={onClose}
            >
              <Text style={styles.backText}>{t("back")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                value.trim().length < 3 ? styles.disabled : styles.confirm,
              ]}
              disabled={value.trim().length < 3}
              onPress={handleConfirmPress}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmText}>{t("Confirm")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "flex-start",
  },
  titlePrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#a3a3a3ff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  back: { backgroundColor: "#eee" }, // خلفية رمادي فاتح
  confirm: { backgroundColor: Colors.primaryColor },
  backText: { color: "#000", fontWeight: "bold" }, // أسود
  confirmText: { color: "#ffffffff", fontWeight: "bold" }, // أبيض
  disabled: {
    backgroundColor: "#ccc", // رصاصي
  },
  priceInput: {
    width: 70,
    height: 40,
    textAlign: "center",
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
  },
});
