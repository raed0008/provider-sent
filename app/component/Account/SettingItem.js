import { Dimensions, StyleSheet, Text, View,I18nManager } from "react-native";
import { Colors } from "../../constant/styles";
import AppText from "../AppText";
import { MaterialIcons } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Share } from "react-native";
import { auth } from "../../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { CART, OFFERS, OFFERS_SCREEN } from "../../navigation/routes";
const { width, height } = Dimensions.get("screen");
import * as Linking from "expo-linking";
import AppModal from "../AppModal";
import ContactUsModal from "./ContactUsModal";
import { useState } from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
export default function SettingItem({ item }) {
  const { icon, name, desc } = item;
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const hideModal = () => setVisible(false);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: "https://njik.com.sa/:اكتشف معنا واستمتع بجميع المميزات التي تقدمها نجيك على التطبيق و الموقع الإلكتروني. لا تفوت الفرصة لتجربة تجربة ممتازة معنا!"
        // You can also add a URL to your app here
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem("userData");

      // Inside your sign-out function:
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }], // Replace 'Login' with the name of your login screen
        })
      );
    } catch (error) {
      console.log(error);
    }
  };
  const handlePress = () => {
    if (icon === "share") {
      onShare();
    } else if (icon === "credit-card") {
      console.log("test");
    } 
    else if (icon === "doc") {
      Linking.openURL("https://njik.com.sa/%D8%A7%D9%84%D8%B4%D8%B1%D9%88%D8%B7-%D9%88%D8%A7%D9%84%D8%A3%D8%AD%D9%83%D8%A7%D9%85/");
    } 
    else if (icon === "question") {
      Linking.openURL("https://njik.com.sa/%d8%ae%d8%af%d9%85%d8%a7%d8%aa%d9%86%d8%a7/");
    } 
    else if (icon === "present") {
        navigation.navigate(OFFERS_SCREEN, { name:"العروض" });
   
    } 
    else if (icon === "social-instagram") {
    setVisible(true)
    } 
    else if (icon === "logout") {
      handleSignOut();
    } else {
      navigation.navigate(icon);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={() => handlePress()}>
      <View style={[styles.item]}>
        <SimpleLineIcons name={icon} size={RFPercentage(3)} color={Colors.primaryColor} />

        <View
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AppText text={name} centered={true} style={[styles.textHeader]} />
<ContactUsModal hideModal={hideModal} visible={visible}/>     
        </View>
 </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  header: {
    color: Colors.primaryColor,
    fontSize: 18,
  },
  textHeader: {
    color: Colors.blackColor,
    fontSize: I18nManager.isRTL ? RFPercentage(1.68) :RFPercentage(1.4),
    // alignSelf:"left"
  },
  headerDescription: {
    color: Colors.grayColor,
    fontSize: 16,
  },
  item: {
    backgroundColor: Colors.piege,
    height: height*0.1,
    // borderWidth:1,
    borderRadius: 10,
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: width * 0.4,
    paddingVertical: 14,
    gap: 5,
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    width: width * 0.4,
    // height:120,
    backgroundColor: Colors.piege,
    padding: 10,
    borderRadius: 10,
    margin: 20,
    justifyContent: "center",
    gap: 15,
  },
});
