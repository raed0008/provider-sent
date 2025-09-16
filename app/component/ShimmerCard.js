import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

const { width } = Dimensions.get("screen");

const ShimmerCard = () => {
  return (
    <ShimmerPlaceholder
      shimmerColors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
      style={styles.card}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    height: 100,
    width: width - 30,
    borderRadius: 12,
    marginBottom: 15,
  },
});

export default ShimmerCard;
