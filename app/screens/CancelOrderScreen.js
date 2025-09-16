import React, { useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloatTextInput from "../component/FloatTextInput";
import AppButton from "../component/AppButton";
import { ORDERS_DETAILS } from "../navigation/routes";
import AppText from "../component/AppText";
import { Colors } from "../constant/styles";
import Toast from "react-native-toast-message";
import { changeOrderStatus } from "../../utils/orders";
import { useTranslation } from "react-i18next";
import { color } from "@rneui/base";

const CancelOrderScreen = ({ route, navigation }) => {
  const { orderId, refetch } = route.params;
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleCancel = async () => {
    if (cancelReason.length < 10) {
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
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await changeOrderStatus(orderId, "cancel_request", {
                providerCancelReason: cancelReason,
              });

              if (res) {
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
              }
              else {
                Toast.show({
                  text1: t("An error occurred. Try again"),
                  type: "error",
                });
              }
            } catch (error) {
              console.log("❌ error cancel request", error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <AppText
        style={{ fontSize: 18, marginBottom: 10, fontWeight: "600", textAlign: "right", color: Colors.primaryColor }}
        text={t("Enter the reason for cancellation")}
      />

      <FloatTextInput
        value={cancelReason}
        onChangeText={(text) => {
          if (text.length <= 200) {
            setCancelReason(text);
            if (text.length >= 10) setErrorMessage("");
          }
        }}
        placeholder={t("Reason for cancellation")}
        multiline
        style={{
          borderWidth: 1,
          borderColor: errorMessage ? "red" : Colors.grayColor,
          padding: 12,
          borderRadius: 8,
          minHeight: 100,
          textAlignVertical: "top",
          textAlign: "right",
        }}
        maxLength={200}
      />

      <Text
        style={{
          color: cancelReason.length < 10 ? "red" : Colors.success,
          marginTop: 10,
          marginLeft: 10,
          textAlign: "left",
          fontSize: 13,
        }}
      >
        {cancelReason.length} / 200
      </Text>


      {errorMessage ? (
        <Text style={{ color: "red", marginTop: 5 }}>{errorMessage}</Text>
      ) : null}

      <View style={{ marginTop: 30 }}>
        <AppButton
          title={isLoading ? t("canceling...") : t("confirm cancel")}
          onPress={handleCancel}
          disabled={isLoading || cancelReason.length < 10}
          style={{
            backgroundColor:
              cancelReason.length < 10 ? Colors.grayColor : Colors.redColor,
          }}
          iconRight={
            isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#fff" />
            )
          }
        />

        <AppButton
          title={t("back")}
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: Colors.primaryColor,
            marginTop: 10,
          }}
          iconRight={<Ionicons name="arrow-back" size={20} color="#fff" />}
        />
      </View>
    </View>
  );
};

export default CancelOrderScreen;
