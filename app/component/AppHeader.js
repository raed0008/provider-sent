import React ,{memo} from "react";
import { Image, TouchableWithoutFeedback, View } from "react-native";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constant/styles";
import { MaterialIcons} from '@expo/vector-icons'
import { useNavigation } from "@react-navigation/native";
import useUserStatus from "../hooks/useUserStatus";
import OrdersListener from "./OrdersListner";
import LocationAgreamentComponent from "./LocationAgreamentComponent";
export default function AppHeader({ subPage = false}) {
  const navigation = useNavigation()
  const UserStatusUpdater = memo(() => {
      // OrdersListener()
      useUserStatus();
      return null; // This component does not render anything
    });

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/icon.png")} style={{
        width:90,
        height:90
      }} height={50} width={50} />
      {subPage && (
        <TouchableWithoutFeedback onPress={()=>navigation.goBack()}>

          <MaterialIcons
            name="arrow-back-ios"
            size={24}
            color={Colors.grayColor}
            />
            </TouchableWithoutFeedback>
          ) 
      }
      <UserStatusUpdater/>
       <LocationAgreamentComponent/>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: Colors.whiteColor,
  },
});
