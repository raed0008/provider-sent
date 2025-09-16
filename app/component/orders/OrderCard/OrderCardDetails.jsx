import {
  Dimensions,
  PlatformColor,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import React, { memo } from "react";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { FontAwesome, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import PriceTextComponent from "../../PriceTextComponent";
import AppText from "../../AppText";
import { setcurrentChatChannel } from "../../../store/features/ordersSlice";
import { CHAT_ROOM_fireBase } from "../../../navigation/routes";
import { Colors } from "../../../constant/styles";
import useNameInLanguage from "../../../hooks/useNameInLanguage";
import { RFPercentage } from "react-native-responsive-fontsize";
import { convertDate } from "../DateOrderComponent";
import { useLanguageContext } from "../../../context/LanguageContext";
import OrderStatusCardComponent from "../OrderStatusCardComponent";

const { width, height } = Dimensions.get("screen");

const OrderCardDetails = ({
  item,
  distance,
  isCompletedScreen,
  showStatus,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { language, direction } = useLanguageContext();
  const { name: itemName } = useNameInLanguage();
  function createMapLink(latitude, longitude) {
    // Check if the platform is iOS
    if (PlatformColor.OS === "ios") {
      // For iOS, use the Apple Maps URL scheme
      // Note: Apple Maps does not support the same query parameters as Google Maps
      // This example opens Apple Maps at the specified coordinates
      return `http://maps.apple.com/?ll=${latitude},${longitude}`;
    } else {
      // For Android, use the Google Maps URL
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
  }

  // Usage
  const handlePhoneCallPress = (phoneNumber) => {
    const formattedNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+${phoneNumber}`;
    let url = `tel:${formattedNumber}`;
    Linking.openURL(url);
  };

  return (
    <View>
      {/* <View style={styles.date}>
        <FontAwesome5
          name="money-bill-wave"
          size={RFPercentage(1.5)}
          color="black"
        />
        <PriceTextComponent
          price={(item?.attributes?.totalPrice)}
          textStyle={{ fontSize: RFPercentage(1.6), fontWeight: "bold" }}
          containerStyle={{
            backgroundColor: "transparent",
            padding: 5,
            paddingHorizontal: 1,
            borderRadius: 15,
            overflow: "hidden",
          }}
        />
      </View> */}

      {/* status (دمجناه هنا) */}
      {showStatus && (
        <View style={styles.date}>
          <MaterialIcons
            name="pending-actions"
            size={RFPercentage(1.85)}
            color="black"
          />
          <OrderStatusCardComponent item={item} />
        </View>
      )}

      {/* date */}
      <View style={[styles.date, { paddingVertical: 5, marginBottom: 5 }]}>
        <FontAwesome name="calendar" size={RFPercentage(1.85)} color="black" />
        <AppText
          text={convertDate(item?.attributes?.date, language)}
          centered={true}
          style={[
            styles.title,
            {
              writingDirection: direction,
            },
          ]}
        />
      </View>

      {/* distance */}
      {distance && (
        <View style={styles.date}>
          <Entypo name="location" size={RFPercentage(1.85)} color="black" />
          <AppText
            text={distance}
            centered={true}
            style={[
              styles.distanceText,
              {
                writingDirection: direction,
              },
            ]}
          />
        </View>
      )}

      {/*time */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={styles.date}>
          <Ionicons
            name="person-outline"
            size={RFPercentage(1.85)}
            color="black"
          />
          <AppText
            text={
              truncateString(
                item?.attributes?.user?.data?.attributes?.username,
                10
              ) || "العميل"
            }
            centered={true}
            style={[
              styles.title,
              {
                width: width * 0.28,
                textAlign: "left", // Align text to the right
              },
            ]}
          />
        </View>
        {!isCompletedScreen &&
          item?.attributes?.provider?.data?.attributes?.name &&
          item?.attributes?.userOrderRating === null && (
            <View style={styles.IconContainer}>
              <TouchableOpacity
                style={styles.chatContainer}
                onPress={() => {
                  dispatch(
                    setcurrentChatChannel(item?.attributes?.chat_channel_id)
                  );
                  navigation.navigate(CHAT_ROOM_fireBase, {
                    ProviderToken:
                      item?.attributes?.provider?.data?.attributes
                        ?.expoPushNotificationToken,
                    ProviderId: item?.attributes?.provider?.data?.id,
                    item: item,
                  });
                }}
              >
                <Entypo name="chat" size={20} color={Colors.primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatContainer}
                onPress={() => {
                  const mapLink = createMapLink(
                    item?.attributes?.googleMapLocation?.coordinate?.latitude,
                    item?.attributes?.googleMapLocation?.coordinate?.longitude
                  );
                  Linking.openURL(mapLink);
                }}
              >
                <Entypo
                  name="location-pin"
                  size={20}
                  color={Colors.primaryColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatContainer}
                onPress={() =>
                  handlePhoneCallPress(
                    item?.attributes?.user?.data?.attributes?.phoneNumber
                  )
                }
              >
                <Entypo name="phone" size={20} color={Colors.primaryColor} />
              </TouchableOpacity>
            </View>
          )}
      </View>
    </View>
  );
};

export default OrderCardDetails;

const styles = StyleSheet.create({
  scrollContainer: {
    height: "100%",
  },
  container: {
    height: "100%",
    backgroundColor: Colors.whiteColor,
    width: width,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    // backgroundColor:'red',
    paddingHorizontal: 11,
    paddingVertical: 4,
    gap: 10,
  },
  orderCardContainer: {
    paddingVertical: 10,
    width: width * 0.88,
    paddingHorizontal: 20,
    height: "auto",
    marginBottom: 10,
    flex: 1,
    gap: 5,
    backgroundColor: Colors.whiteColor,
    shadowColor: Colors.grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,

    elevation: 0.4,
    borderColor: Colors.grayColor,
    borderWidth: 1.4,
    borderRadius: 8,
  },
  name: {
    color: Colors.blackColor,
    fontSize: RFPercentage(1.5),
  },
  title: {
    color: Colors.blackColor,
    fontSize: RFPercentage(1.5),
  },
  price: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(1.5),
  },
  status: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(1.5),
  },
  date: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  chatContainer: {
    paddingHorizontal: 15,
    backgroundColor: "transparent",
    borderColor: Colors.primaryColor,
    borderWidth: 1.5,
    width: width * 0.131,
    height: height * 0.04,
    borderRadius: 20,
    // marginHorizontal:width*0.65,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  IconContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  distanceText: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(1.6),
    fontWeight: "bold",
  },
});

const truncateString = (str, num) => {
  if (str?.length <= num) {
    return str;
  }
  return str?.slice(0, num) + "...";
};
