import { View, StyleSheet, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import RBSheet from 'react-native-raw-bottom-sheet'
import AppText from '../AppText'
import { TextInput } from 'react-native'
import AppButton from '../AppButton'
import { Colors } from '../../constant/styles'

const { width, height } = Dimensions.get('screen')

const ExtraPaymentDetails = ({ setSpareParts }) => {
  const refRBSheet = useRef();
  const [partPrice, setPartPrice] = useState(null);
  const [partName, setPartName] = useState("");

  const handleAddPartPrice = (text) => {
    const parsedAmount = Number(text);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      setPartPrice(parsedAmount);
    } else {
      setPartPrice(null);
    }
  };

  const handleAddSparePart = () => {
    setSpareParts((prevParts) => [
      ...prevParts,
      { 
        partPrice: partPrice, 
        partName: partName,
        // يمكن إضافة spareImage لاحقاً
      },
    ]);
    setPartPrice(null);
    setPartName("");
    refRBSheet.current.close();
  };

  return (
    <RBSheet
      ref={refRBSheet}
      closeOnDragDown={true}
      closeOnPressMask={false}
      height={height * 0.5}
      customStyles={{
        wrapper: { backgroundColor: "transparent" },
        draggableIcon: { backgroundColor: "#000" },
        container: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }
      }}
    >
      <View style={styles.sheetContent}>
        <AppText
          text={"إضافة قطعة غيار"}
          style={styles.sheetTitle}
          centered={true}
        />

        <View style={styles.amountContainer}>
          <AppText
            text={"اسم القطعة"}
            centered={true}
            style={[styles.amountText, { paddingHorizontal: 20 }]}
          />
          <TextInput
            selectionColor={Colors.blueColor}
            value={partName}
            onChangeText={(text) => setPartName(text)}
            style={styles.input}
            placeholder="أدخل اسم القطعة"
          />
        </View>

        <View style={styles.amountContainer}>
          <AppText
            text={"السعر"}
            centered={true}
            style={[styles.amountText, { paddingHorizontal: 20 }]}
          />
          <TextInput
            keyboardType="numeric"
            selectionColor={Colors.blueColor}
            value={partPrice?.toString()}
            onChangeText={(text) => handleAddPartPrice(text)}
            style={styles.input}
            placeholder="أدخل السعر"
          />
        </View>

        <AppButton
          disabled={partPrice === null || partName === ""}
          title={"إضافة القطعة"}
          onPress={handleAddSparePart}
        />
      </View>
    </RBSheet>
  )
}

export default ExtraPaymentDetails

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryColor,
    marginBottom: 10,
  },
  amountContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  amountText: {
    paddingHorizontal: 10,
    color: Colors.blackColor,
    minWidth: 80,
  },
  input: {
    color: Colors.blueColor,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    flex: 1,
    borderColor: Colors.blueColor,
  },
});