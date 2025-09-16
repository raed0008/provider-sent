import { View, StyleSheet, Dimensions, TextInput, Image } from "react-native";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { saveSparePartTemp } from "../../../store/features/sparePartsSlice";
import AppText from "../../AppText";
import { Colors } from "../../../constant/styles";
import { useTranslation } from "react-i18next";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomImagePicker from "../../../screens/firebaseChat/ImagePicker";
import { uploadImage } from "../../../screens/firebaseChat/helpers";
import { ActivityIndicator, Divider } from "react-native-paper";
const { width, height } = Dimensions.get("screen");

const AddSparePartsSheet = ({ setSpareParts }) => {
  const dispatch = useDispatch();
  const [additionalAmount, setAdditionalAmount] = useState(null);
  const [billImage, setBillImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  const saveSpareParts = (amount, billImage) => {
    if (amount > 0 && billImage) {
      setSpareParts((prev) => [...prev, { amount, billImage }]);
    }
  };

  const handleConfirmAmount = () => {
    if (additionalAmount && additionalAmount > 0) {
      dispatch(saveSparePartTemp({ amount: additionalAmount, billImage }));
    }
  };

  const handleConfirmImage = () => {
    if (additionalAmount > 0 && billImage) {
      const newPart = { amount: additionalAmount, billImage };
      setSpareParts((prev) => {
        const updated = [...prev, newPart];
        console.log("🟡 Updated spareParts (from confirm image):", updated);
        return updated;
      });
      dispatch(saveSparePartTemp(newPart));
    }
  };

  const handleAddAdditionalPrice = (text) => {
    const parsedAmount = Number(text);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      setAdditionalAmount(parsedAmount);
      setSpareParts([{ amount: parsedAmount, billImage }]);
      dispatch(saveSparePartTemp({ amount: parsedAmount, billImage }));
    } else {
      setAdditionalAmount(null);
      setSpareParts([]);
      dispatch(saveSparePartTemp({ amount: null, billImage: null }));
    }
  };

  const handleImageSelected = async (imageUri) => {
    setUploading(true);
    try {
      const downloadURL = await uploadImage([imageUri], {}, "image", 5);
      if (downloadURL) {
        const img = downloadURL[0];
        setBillImage(img);
        setSpareParts([{ amount: additionalAmount, billImage: img }]);
        dispatch(saveSparePartTemp({ amount: additionalAmount, billImage: img }));
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ padding: 16, alignSelf: "flex-start" }}>
      {/* العنوان */}
      <AppText
        text={t("spare_parts")}
        centered={true}
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 5,
          alignSelf: "flex-start",
          color: Colors.blackColor,
        }}
      />
      <Divider
        style={{
          marginVertical: 10,
          backgroundColor: Colors.primaryColor,
          paddingBottom: 1,
          marginBottom: 40,
        }}
      />
      {/* إدخال المبلغ */}
      <View style={[styles.amountContainer, { alignSelf: "flex-start" }]}>
        <AppText text={t("amount")} centered={true} style={styles.amountText} />
        <TextInput
          keyboardType="numeric"
          selectionColor={Colors.blueColor}
          value={additionalAmount?.toString()}
          onChangeText={handleAddAdditionalPrice}
          style={[styles.input, { alignSelf: "flex-start" }]}
        />
        <MaterialIcons
          name="check-circle"
          size={30}
          color={additionalAmount > 0 ? Colors.primaryColor : "#ccc"}
          onPress={handleConfirmAmount}
          style={{ marginTop: 5 }}
        />
      </View>

      {/* رفع صورة الفاتورة */}
      <View style={[styles.descriptionContainer2, { alignSelf: "flex-start" }]}>
        <AppText
          text={t("bill_image")}
          centered={true}
          style={styles.amountText}
        />
        {billImage ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{ uri: billImage }}
              height={100}
              width={100}
              style={{ borderRadius: 15 }}
            />
            <MaterialIcons
              onPress={() => {
                setBillImage(null);
                setSpareParts([]);
                dispatch(saveSparePartTemp({ amount: null, billImage: null }));
              }}
              name="delete"
              size={34}
              color="red"
              style={{
                marginLeft: 5,
              }}
            />
            <MaterialIcons
              name="check-circle"
              size={30}
              color={billImage ? Colors.primaryColor : "#ccc"}
              onPress={handleConfirmImage}
              style={{ marginLeft: 10 }}
            />
          </View>
        ) : uploading ? (
          <ActivityIndicator />
        ) : (
          <CustomImagePicker
            iconSize={30}
            containerStyles={{ height: 60, width: 60 }}
            CameraStyle={{
              padding: 15,
              height: height * 0.09,
              width: width * 0.2,
              backgroundColor: Colors.primaryColor,
            }}
            CameraSize={40}
            onImageSelected={handleImageSelected}
          />
        )}
      </View>
    </View>
  );
};

export default AddSparePartsSheet;

const styles = StyleSheet.create({
  amountContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  amountText: {
    paddingHorizontal: 10,
    color: Colors.blackColor,
  },
  input: {
    color: Colors.blueColor,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 5,
    fontSize: 16,
    borderColor: Colors.blueColor,
    width: 100,
  },
  descriptionContainer2: {
    marginTop: 10,
    backgroundColor: Colors.whiteColor,
    padding: 10,
    borderRadius: 10,
  },
});
