import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { ScrollView } from "react-native-virtualized-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from 'react-redux'
import { Button, Checkbox } from "react-native-paper";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import useCategories from "../../../utils/categories";
import { Colors } from "../../constant/styles";
import ArrowBack from "../../component/ArrowBack";
import AppText from "../../component/AppText";
import AppButton from "../../component/AppButton";
import { setCurrentRegisterProperties } from "../../store/features/registerSlice";
import { CHOOSE_DCOUMENT } from "../../navigation/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserLocation from "../../component/Home/UserLocation";
import AgreamentProminentDisclosureLocation from '../../component/ProminentDisclosure'
import useNameInLanguage from "../../hooks/useNameInLanguage";
import { useLanguageContext } from "../../context/LanguageContext";
import LocationPermissionComponent from "./LocationPermission/LocationPermissionComponent";

const { width } = Dimensions.get("screen");

export default function ChooseCategories({ navigation, }) {
  const [gender, setGender] = useState("");
  const { data: categories } = useCategories();
  const dispatch = useDispatch()
  const [checked, setChecked] = useState({});
  const { name: itemName } = useNameInLanguage()


  const toggleChecked = (id) => {
    // Copy the checked object
    const newChecked = { ...checked };
    // Toggle the value at the given id
    newChecked[id] = !newChecked[id];
    // Update the state
    setChecked(newChecked);
  };
  const getSelectedIds = () => {
    // Get an array of the keys of the checked object
    const keys = Object.keys(checked);
    // Filter the keys that have a true value
    const selectedIds = keys.filter((key) => checked[key]);
    // Return the array of the selected item ids
    return selectedIds;
  };
  const handlePressConfirm = async () => {
    const objects = getSelectedIds().map(id => ({ id: id }));
    const categoriesData = {
      categories: {
        connect: objects,
      }
    };

    // 1. خزن في redux
    dispatch(setCurrentRegisterProperties(categoriesData));

    // 2. خزن نسخة في AsyncStorage
    await AsyncStorage.setItem("registerDataCategories", JSON.stringify(categoriesData));

    // 3. تابع الخطوات
    navigation.navigate(CHOOSE_DCOUMENT);
    console.log("checked", getSelectedIds());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <ArrowBack />

      <View style={styles.container}>
        <View style={styles.container2}>
          <AppText
            text={"What services do you intend to provide?"}
            centered={true}
            style={styles.text1}
          />
          {getSelectedIds()?.length > 0 && (
            <View style={styles.numberContainer}>
              <AppText
                text={`the number of selected specialties`}
                style={{ fontSize: RFPercentage(1.9), color: Colors.blackColor }}
              />
              <AppText
                text={getSelectedIds()?.length}
                style={{ fontSize: RFPercentage(1.9), color: Colors.primaryColor }}
              />
            </View>
          )}

          <AppText
            text={"Choose the most relevant specialties from the list"}
            style={styles.text3}
          />

          <FlatList
            data={categories}
            style={{
              flex: 1,
              paddingHorizontal: width * 0.015,
            }}
            renderItem={({ item }) => (
              <ItemSelected
                setGender={setGender}
                checked={checked[item?.id] ? "checked" : "unchecked"}
                onPress={() => toggleChecked(item?.id)}
                text={item?.attributes[itemName]}
              />
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={<View style={{ height: 10 }} />}
          />

          {getSelectedIds()?.length > 0 && (
            <AppButton
              title={"Confirm"}
              style={{ marginBottom: 10, paddingVertical: 15 }}
              onPress={handlePressConfirm}
            />
          )}
        </View>
      </View>
      <LocationPermissionComponent />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  container2: {
    flex: 1,
    paddingHorizontal: 0,
    gap: 10
  },
  text1: {
    fontSize: RFPercentage(2),
    color: Colors.primaryColor,
    maxWidth: width,
    paddingHorizontal: width * 0.015,
    // textAlign:'left'

  },
  text2: {
    fontSize: RFPercentage(1.5),
    width: width * 1,
    maxWidth: width * 1,
    color: Colors.blackColor,
    paddingHorizontal: width * 0.065
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    width: width * 0.9,
    justifyContent: 'center',
    flexDirection: "row",
  },
  text3: {
    backgroundColor: Colors.grayColor,
    fontSize: RFPercentage(1.6),
    width: width * 1,
    maxWidth: width * 1,
    color: Colors.blackColor,
    paddingHorizontal: 25,
    paddingVertical: 10,
    textAlign: 'left'
  },
  searchinput: {
    borderWidth: 1,
    padding: 1,
    fontSize: 1,
    borderColor: Colors.grayColor,
    width: width * 0.9,
    backgroundColor: "white",
    height: 50, // Decrease the height to 40 pixels
    // paddingHorizontal: 10, // Decrease the horizontal padding to 10 pixels
    // paddingVertical: 5, // Increase the vertical padding to 5 pixels
    borderRadius: 10, // Add some border radius
    margin: 10, // Add some margin
    elevation: 5, // Add some elevation
  },
  icon: {
    backgroundColor: Colors.blueColor,
    padding: 13,
    borderRadius: 10,
    borderTopLeftRadius: 1,
    borderBottomLeftRadius: 1,
  },
  numberContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    // width: width * 1,
    // paddingVertical:10,
    backgroundColor: 'white'
  },
});
const ItemSelected = ({ setGender, text, onPress, checked }) => {
  const language = useLanguageContext()
  return (
    <Pressable onPress={onPress}
      style={[Genderstyles.container, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
      <AppText text={text} style={{ color: Colors.blackColor, fontSize: RFPercentage(2), textAlign: 'right' }} />
      <View style={{ backgroundColor: Colors.grayColor, borderRadius: 15, paddingHorizontal: 10 }}>

        <Checkbox
          style={Genderstyles.radioItem} /* Apply style here */
          color={Colors.primaryColor}
          status={checked}

        />
      </View>
    </Pressable>
  );
};
const Genderstyles = StyleSheet.create({
  container: {
    marginTop: 16,
    justifyContent: "space-between"
    , display: 'flex',
    // flex:1,
    // backgroundColor:'red'
  },
  radioItem: {
    flexDirection: "row-reverse",
    fontSize: RFPercentage(2.5),
    justifyContent: "space-between",
    backgroundColor: 'red',
    height: 100,
    width: 100
    /* Reverse radio and label within each item */
  },
});

