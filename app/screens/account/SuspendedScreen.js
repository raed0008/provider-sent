import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Colors } from "../../constant/styles";
import { useNavigation } from "@react-navigation/native";
import AppText from "../../component/AppText";
import { useTranslation } from "react-i18next";
import ContactUsModal from "../../component/Account/ContactUsModal";

const { width } = Dimensions.get("screen");

const SuspendedScreen = ({ duration, isBanned = false }) => {
  const [remainingTime, setRemainingTime] = useState(duration || 0);
  const [showContactModal, setShowContactModal] = useState(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const fadeAnim = useState(new Animated.Value(0))[0];

  // Convert seconds to readable text
  const formatTime = (seconds) => {
    if (isBanned) return t("permanently_suspended");
    if (seconds <= 0) return t("activated");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isBanned || remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime, isBanned]);

  const isActive = !isBanned && remainingTime <= 0;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isActive
                ? "#10B981"
                : isBanned
                ? "#EF4444"
                : "#FFA500",
            },
          ]}
        />

        {/* Title */}
        <AppText
          style={styles.title}
          text={
            isActive
              ? t("account_active")
              : isBanned
              ? t("account_banned")
              : t("account_suspended")
          }
        />

        {/* Description */}
        <AppText
          style={styles.description}
          text={
            isActive
              ? t("can_continue")
              : isBanned
              ? t("permanently_suspended_message")
              : t("temporarily_suspended")
          }
        />

        {/* Timer - Only show for temporary suspension */}
        {!isBanned && (
          <View style={styles.timerBox}>
            <AppText
              style={styles.timerLabel}
              text={isActive ? t("status") : t("time_remaining")}
            />
            <AppText
              style={[
                styles.timerValue,
                { color: isActive ? "#10B981" : "#EF4444" },
              ]}
              text={formatTime(remainingTime)}
            />
          </View>
        )}

        {/* Buttons */}
        {isActive && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.primaryColor }]}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "App" }],
              });
            }}
            activeOpacity={0.8}
          >
            <AppText style={styles.buttonText} text="continue" />
          </TouchableOpacity>
        )}

        {/* Help Text - Always show for banned or suspended */}
        {(isBanned || !isActive) && (
          <TouchableOpacity
            onPress={() => setShowContactModal(true)}
            activeOpacity={0.7}
            style={{ marginTop: isBanned ? 24 : 16 }}
          >
            <AppText style={styles.helpText} text={t("need_help")} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <ContactUsModal
        visible={showContactModal}
        hideModal={() => setShowContactModal(false)}
      />
    </View>
  );
};

export default SuspendedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  timerBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  timerValue: {
    fontSize: 36,
    fontWeight: "700",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  helpText: {
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "underline",
  },
});
