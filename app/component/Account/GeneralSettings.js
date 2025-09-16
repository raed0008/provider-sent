import { View, StyleSheet, FlatList } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "../AppText";
import { Colors } from "../../constant/styles";
import SettingItem from "./SettingItem";
import { settingsItemArray } from "../../data/account";
import { auth } from "../../../firebaseConfig";
import { RFPercentage } from "react-native-responsive-fontsize";

export default function GeneralSettings() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons
          name="settings-outline"
          size={24}
          color={Colors.primaryColor}
        />

        <AppText text="Settings" style={styles.header} />
      </View>
      <View>
        <FlatList
          data={settingsItemArray}
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
          renderItem={({ item }) => {
            return <SettingItem item={item} />;
          }}
          keyExtractor={(item, index) => item.name + index}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  
  header: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(2),
  },
  textHeader: {
    color: Colors.blackColor,
    fontSize: RFPercentage(2),
  },
  headerDescription: {
    color: Colors.grayColor,
    fontSize: 16,
  },
  item: {
    backgroundColor: Colors.whiteColor,
    height: 70,
    borderRadius: 12,
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // width: width * 1,
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    // justifyContent:'center',
    gap: 15,
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
    backgroundColor:Colors.whiteColor,
    paddingHorizontal: 10,
    gap: 10,
  },
});
