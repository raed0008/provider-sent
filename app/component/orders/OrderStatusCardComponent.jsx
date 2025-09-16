import { Dimensions, StyleSheet, View } from "react-native";
import React, { memo } from "react";
import { Colors } from "../../constant/styles";
import AppText from "../../component/AppText";
import { RFPercentage } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get("screen");

const OrderStatusCardComponent = ({ item }) => {
  return (
    <View style={styles.date}>
      <AppText text={`Status`} centered={true} style={styles.status} />
      <AppText
        text={`${
          item?.attributes?.status === "assigned"
            ? "New"
            : item?.attributes?.status === "pending"
            ? "New"
            : item?.attributes?.status === "accepted"
            ? "Accepted"
            : item?.attributes?.status === "working"
            ? "Working"
            : item?.attributes?.status === "change_price"
            ? "Price Changing"
            : item?.attributes?.status === "cancel_request"
            ? "Cancellation Requested"
            : item?.attributes?.status === "finish_work"
            ? "Waiting for payment"
            : item?.attributes?.status === "delayed"
            ? "postponed"
            : item?.attributes?.status === "payed"
            ? "Payed"
            : item?.attributes?.status === "finished"
            ? "Finished"
            : item?.attributes?.provider_payment_status === "payment_required"
            ? "waiting for the payment"
            : "Unknown" ? "Unknown" : "Unknown"
        }`}
        centered={true}
        style={styles.title}
      />
    </View>
  );
};

export default memo(OrderStatusCardComponent);

const styles = StyleSheet.create({
  title: {
    color: Colors.blackColor,
    fontSize: RFPercentage(1.6),
  },
  status: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(1.8),
  },
  date: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    flexDirection: "row",
  },
});
