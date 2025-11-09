import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloatTextInput from "../component/FloatTextInput";
import AppButton from "../component/AppButton";
import { ORDERS_DETAILS } from "../navigation/routes";
import AppText from "../component/AppText";
import { Colors } from "../constant/styles";
import Toast from "react-native-toast-message";
import { changeOrderStatus } from "../../utils/orders";
import { incrementCancelRequestsCount } from "../../utils/user";
import { useTranslation } from "react-i18next";

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 200;

const CancelOrderScreen = ({ route, navigation }) => {
  const { orderId, refetch, providerId } = route.params;
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const getRealLength = useCallback((text) => {
    const lettersOnly = text.match(/[A-Za-z\u0621-\u064A]/g);
    return lettersOnly ? lettersOnly.length : 0;
  }, []);

  const realLength = useMemo(
    () => getRealLength(cancelReason),
    [cancelReason, getRealLength]
  );

  const isValidLength = realLength >= MIN_REASON_LENGTH;

  const handleTextChange = useCallback(
    (text) => {
      if (text.length <= MAX_REASON_LENGTH) {
        setCancelReason(text);
        if (getRealLength(text) >= MIN_REASON_LENGTH) {
          setErrorMessage("");
        }
      }
    },
    [getRealLength]
  );

  const handleCancelConfirm = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await changeOrderStatus(orderId, "cancel_request", {
        providerCancelReason: cancelReason.trim(),
      });

      if (res) {
        await incrementCancelRequestsCount(providerId);
        Toast.show({
          text1: t("Cancellation request sent successfully"),
          type: "success",
        });
        
        if (refetch) await refetch();

        navigation.navigate({
          name: route.params.from || ORDERS_DETAILS,
          params: { cancelled: true },
          merge: true,
        });
      } else {
        Toast.show({
          text1: t("An error occurred. Try again"),
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error cancel request:", error);
      Toast.show({
        text1: t("An error occurred. Try again"),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [orderId, cancelReason, providerId, refetch, navigation, route.params.from, t]);

  const handleCancel = useCallback(() => {
    if (!isValidLength) {
      setErrorMessage(t("The reason must be 10 characters or more"));
      return;
    }

    Alert.alert(
      t("confirm cancel"),
      t("Are you sure you want to cancel the order?"),
      [
        { text: t("back"), style: "cancel" },
        {
          text: t("Confirm"),
          style: "destructive",
          onPress: handleCancelConfirm,
        },
      ]
    );
  }, [isValidLength, t, handleCancelConfirm]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AppText
        style={styles.title}
        text={t("Enter the reason for cancellation")}
      />

      <FloatTextInput
        value={cancelReason}
        onChangeText={handleTextChange}
        placeholder={t("Reason for cancellation")}
        multiline
        style={[
          styles.textInput,
          errorMessage && styles.textInputError,
        ]}
        maxLength={MAX_REASON_LENGTH}
        editable={!isLoading}
      />

      <Text
        style={[
          styles.charCounter,
          !isValidLength && styles.charCounterError,
          isValidLength && styles.charCounterSuccess,
        ]}
      >
        {realLength} / {MAX_REASON_LENGTH}
      </Text>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <View style={styles.buttonsContainer}>
        <AppButton
          title={isLoading ? t("canceling...") : t("confirm cancel")}
          onPress={handleCancel}
          disabled={isLoading || !isValidLength}
          style={[
            styles.confirmButton,
            !isValidLength && styles.disabledButton,
          ]}
          iconRight={
            isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#fff" />
            )
          }
        />

        <AppButton
          title={t("back")}
          onPress={handleGoBack}
          disabled={isLoading}
          style={styles.backButton}
          iconRight={<Ionicons name="arrow-back" size={20} color="#fff" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "right",
    color: Colors.primaryColor,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.grayColor,
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: "top",
    textAlign: "right",
  },
  textInputError: {
    borderColor: "red",
  },
  charCounter: {
    marginTop: 10,
    marginLeft: 10,
    textAlign: "left",
    fontSize: 13,
  },
  charCounterError: {
    color: "red",
  },
  charCounterSuccess: {
    color: Colors.success,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  buttonsContainer: {
    marginTop: 30,
  },
  confirmButton: {
    backgroundColor: Colors.redColor,
  },
  disabledButton: {
    backgroundColor: Colors.grayColor,
  },
  backButton: {
    backgroundColor: Colors.primaryColor,
    marginTop: 10,
  },
});

export default CancelOrderScreen;