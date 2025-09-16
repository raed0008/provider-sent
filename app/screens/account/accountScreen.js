import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { EXPO_PUBLIC_BASE_URL } from "@env";
import * as Linking from "expo-linking";

import { Colors } from "../../constant/styles";
import GeneralSettings from "../../component/Account/GeneralSettings";
import Logo from "../../component/Logo";
import AppText from "../../component/AppText";
import { useSelector } from "react-redux";
import { ScrollView } from "react-native-virtualized-view";
// import { SocailLinks } from "../../data/SocialLinks";
import SocailLinksComponent from "../../component/Account/SocailLinksComponent";
import AppButton from "../../component/AppButton";
import { auth } from "../../../firebaseConfig";
import { CommonActions } from "@react-navigation/native";
import { RFPercentage } from "react-native-responsive-fontsize";

const { width } = Dimensions.get("screen");

const AccountScreen = ({ navigation, route }) => {

  
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bodyBackColor }}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
         <View style={styles.LogoStyles}> 
          </View> 
          <GeneralSettings />
          <AppText text={"Our Accounts On Social Media"} style={styles.title} />
          <SocailLinksComponent />
          <TouchableWithoutFeedback
            onPress={() => Linking.openURL("https://njik.com.sa/")}
          >
            <View>
              <AppText text={"www.njik.com.sa"} style={styles.website} />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  ImageContainer: {
    paddingHorizontal: width * 0.4,
    // backgroundColor:'red',
    paddingTop: width * 0.05,
    paddingBottom: width * 0.03,
    // marginTop:50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: width * 0.3,
    // borderWidth:4,
    // borderColor:Colors.blueColor,
    width: width * 0.3,
    margin: "auto",
    borderRadius: width * 0.3 * 0.5,
  },
  title: {
    fontSize: RFPercentage(1.8),
    paddingVertical: 10,
  },
  website: {
    fontSize: RFPercentage(2),
    paddingVertical: 10,
    color:Colors.primaryColor
  },
  LogoStyles: {
    padding: 17,
    marginTop:30
  },
});
