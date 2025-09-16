import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import AddSparePartsSheet from "./AddSparePartsSheet";
import RenderAdditionalPriceList from "./RenderAdditionalPriceList";

const { width } = Dimensions.get("screen");

const ChooseSparePartsOnly = ({ setSpareParts, spareParts }) => {
  return (
    <View style={styles.container}>
      {/* شاشة إضافة قطع الغيار */}
      <AddSparePartsSheet setSpareParts={setSpareParts} />

      {/* عرض قائمة القطع المضافة */}
      {/* <RenderAdditionalPriceList
        additionalAmounts={spareParts}
        setAdditionalAmounts={setSpareParts}
      /> */}
    </View>
  );
};

export default ChooseSparePartsOnly;

const styles = StyleSheet.create({
  container: {
    width,
    paddingHorizontal: 10,
    marginTop: 10,
  },
});
