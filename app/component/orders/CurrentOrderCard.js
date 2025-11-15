import {
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  I18nManager,
  Text,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constant/styles";
import OrderCardHeaderComponent from "./OrderCardHeaderComponent";
import OrderCardDetails from "./OrderCard/OrderCardDetails";
import { GetOrderData, useSingleOrder } from "../../../utils/orders";
import { SingleCardLoading } from "../loading/SingelCardLoading";
import { color, Skeleton } from "@rneui/base";
import { useLanguageContext } from "../../context/LanguageContext";
import { PAY_AFTER_SERVICES_SCREEN } from "../../navigation/routes";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSelector } from "react-redux";
// import { getDistanceKm } from "../../../utils/distance";

const { width, height } = Dimensions.get("screen");

function CurrentOrderCard({ orderId, onPress, refreshing, hideActions, isCompletedScreen }) {
  const { data: currentOrderData, isLoading } = useSingleOrder(orderId, refreshing);
  const { language, direction } = useLanguageContext();
  const { t } = useTranslation();
  const [entryTime] = useState(new Date());
  const navigation = useNavigation();

  // Get provider location from Redux state
  const provider = useSelector((state) => state.user?.userData);

  const isRTL = direction === 'rtl' || language === 'ar';

  // Calculate distance between provider and order
  // const calculateDistance = () => {
  //   if (!currentOrderData || !provider) return null;

  //   const orderLocation = {
  //     latitude: Number(currentOrderData?.attributes?.googleMapLocation?.coordinate?.latitude),
  //     longitude: Number(currentOrderData?.attributes?.googleMapLocation?.coordinate?.longitude),
  //   };

  //   const providerLocation = {
  //     latitude: Number(provider?.attributes?.googleMapLocation?.coordinate?.latitude),
  //     longitude: Number(provider?.attributes?.googleMapLocation?.coordinate?.longitude),
  //   };

  //   console.log("📍 Order Location:", orderLocation);
  //   console.log("📍 Provider Location:", providerLocation);

  //   if (
  //     orderLocation.latitude &&
  //     orderLocation.longitude &&
  //     providerLocation.latitude &&
  //     providerLocation.longitude
  //   ) {
  //     const distance = getDistanceKm(providerLocation, orderLocation);
  //     console.log("📏 Calculated Distance:", distance);
  //     return distance;
  //   }
  //   return null;
  // };

  // const distance = calculateDistance();

  const getTimeRemainingFromNow = () => {
    const now = new Date();
    const entryDateOnly = new Date(entryTime.getFullYear(), entryTime.getMonth(), entryTime.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const color = 'red';

    const diffInMs = nowDateOnly - entryDateOnly;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const remaining = 30 - diffInDays;

    return remaining <= 0
      ? t("Deleted")
      : `${t("Will expire in")} ${remaining} ${t("days")}`;
  };

  if (isLoading) return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Skeleton
        animation="wave"
        height={height * 0.18}
        width={width * 0.92}
        style={styles.loadingSkeleton}
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (currentOrderData?.attributes?.status === "working") {
          navigation.navigate(PAY_AFTER_SERVICES_SCREEN, { item: currentOrderData });
        } else {
          console.log("➡️ Calling onPress with order:", currentOrderData);
          onPress(currentOrderData);
        }
      }}
    >
      <View style={[
        styles.orderCardContainer,
        {
          backgroundColor: currentOrderData?.attributes?.packages?.data?.length > 0
            ? Colors.piege
            : Colors.whiteColor,
          alignSelf: isRTL ? 'flex-end' : 'flex-start',
          flexDirection: 'column',
        }
      ]}>
        <OrderCardHeaderComponent item={currentOrderData} />
        <OrderCardDetails
          item={currentOrderData}
          // distance={distance}
          hideActions={hideActions}
          isCompletedScreen={isCompletedScreen}
          showStatus={true}
        />
        {isCompletedScreen && (
          <View style={{ marginTop: 5 }}>
            <Text style={{ fontSize: 12, color: 'red' }}>
              {getTimeRemainingFromNow()}
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default memo(CurrentOrderCard);

const styles = StyleSheet.create({
  orderCardContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: width * 0.92,
    minHeight: height * 0.16,
    marginBottom: 12,
    backgroundColor: Colors.whiteColor,

    shadowColor: Colors.blackColor,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 6,

    // Border
    borderColor: Colors.grayColor,
    borderWidth: 0.5,
    borderRadius: 12,

    // Layout
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 12,
  },

  loadingSkeleton: {
    borderRadius: 12,
    backgroundColor: Colors.grayColor,
    marginBottom: 12,
    marginHorizontal: width * 0.04,
  },
});