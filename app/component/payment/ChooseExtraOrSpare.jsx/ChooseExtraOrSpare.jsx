import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import AddSparePartsSheet from './AddSparePartsSheet';
import RenderAdditionalPriceList from './RenderAdditionalPriceList';

const { width } = Dimensions.get("screen");

const ChooseSparePartsOnly = ({ setSpareParts, spareParts }) => {
  return (
    <View style={styles.container}>
      {/* شاشة إضافة قطع الغيار */}
      <AddSparePartsSheet setSpareParts={setSpareParts} />
      
      {/* قائمة القطع المضافة */}
      <RenderAdditionalPriceList
        setAdditionalAmounts={setSpareParts}
        additionalAmounts={spareParts}
      />
    </View>
  );
};

export default ChooseSparePartsOnly;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: width,
  },
});
