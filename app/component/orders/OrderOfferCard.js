import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Sizes, Colors, Fonts } from "../../constant/styles";
import AppText from "../AppText";
import useNameInLanguage from "../../hooks/useNameInLanguage";
import { RFPercentage } from "react-native-responsive-fontsize";
import { color, Skeleton } from "@rneui/base";
import tw from "twrnc";
import PriceTextComponent from "../PriceTextComponent";
import {
  MaterialIcons,
  SimpleLineIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { convertDate } from "./DateOrderComponent";
import { useLanguageContext } from "../../context/LanguageContext";
import AppModal from "../AppModal";
import LoadingScreen from "../../screens/loading/LoadingScreen";
import NotificationBanner from "../NotificationBanner";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import useNotifications from "../../../utils/notifications";
import {
  updateUserData,
  getProviderById as getUserDataById,
} from "../../../utils/user";
import {
  acceptOrder,
  GetProvidersOrders,
  useSingleOrder,
} from "../../../utils/orders";
import {
  HOME,
  ORDERS_DETAILS,
  ORDERS,
  MY_ORDERS,
} from "../../navigation/routes";
import OrderImagesComponent from "../orders/OrderImagesComponent";
import SelectedServicesList from "../orders/OrderDetails/SelectedServicesList";
import CartListItemDetails from "../../screens/Item/CartListItemDetails";
import CustomAcceptButton from "../CustomAcceptButton";
import Toast from "react-native-toast-message";
import { getDistanceKm } from "../../../utils/distance";

const { width } = Dimensions.get("screen");

// ExpandableText component for handling long text
const ExpandableText = ({ text, style }) => {
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const { t } = useTranslation();

  if (!text) return null;

  return (
    <View style={{ flexDirection: "column", flex: 1 }}>
      <Text
        style={[
          styles.content,
          style,
          { flexShrink: 1, marginStart: 6, textAlign: "auto" },
        ]}
        numberOfLines={expanded ? 0 : 2}
        ellipsizeMode="tail"
        onTextLayout={(e) => {
          if (e.nativeEvent.lines.length > 2) {
            setShowMore(true);
          } else {
            setShowMore(false);
          }
        }}
      >
        {text}
      </Text>

      {showMore && (
        <Text
          style={{
            color: Colors.primaryColor,
            fontSize: 11,
            marginTop: 2,
            marginStart: 6,
          }}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? t("hide") : t("more...")}
        </Text>
      )}
    </View>
  );
};

// Skeleton loader component
const OrderCardSkeleton = () => (
  <View style={{ width: "100%", alignItems: "center", marginBottom: 12 }}>
    <Skeleton
      animation="wave"
      height={180}
      width={width * 0.92}
      style={{ borderRadius: 12 }}
    />
  </View>
);

export default function OrderOfferCard({ item, onPress, children }) {
  const navigation = useNavigation();
  const provider = useSelector((state) => state?.user?.userData);
  const providerData = provider;
  const { t } = useTranslation();
  const { name: ItemsName, location } = useNameInLanguage();

  const { data: orderData, isLoading } = useSingleOrder(item?.id);
  const order = orderData?.attributes;

  const name =
    order?.services?.data[0]?.attributes?.category?.data?.attributes[ItemsName];
  const imageUrl =
    order?.services?.data[0]?.attributes?.category?.data?.attributes?.image
      ?.data[0]?.attributes?.url;
  const cartItemName =
    order?.service_carts?.data[0]?.attributes?.service?.data?.attributes
      ?.category?.data?.attributes[ItemsName];
  const { language, direction } = useLanguageContext();
  const { sendPushNotification } = useNotifications();

  // State management from ItemScreen
  const [ModalisLoading, setModalIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [canAccept, setCanAccept] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isManuallyChecking, setIsManuallyChecking] = useState(false);

  const createUniqueName = (userId, providerId, orderId) => {
    return `user_${userId}_provider_${providerId}_order_${orderId}`;
  };

  const checkLastOrderTime = async () => {
    try {
      setCanAccept(false);
      setCountdown(null);

      const updatedProvider = await getUserDataById(provider?.id);
      if (!updatedProvider) return;

      const orders = await GetProvidersOrders(provider?.id);

      if (!orders || orders.length === 0) {
        setCanAccept(true);
        setTimeLeft(null);
        setCountdown(null);
        return null;
      }

      const sorted = orders
        .filter((order) =>
          ["assigned", "working", "payment_required", "finished"].includes(
            order?.attributes?.status
          )
        )
        .sort(
          (a, b) =>
            new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
        );

      if (sorted.length === 0) {
        setCanAccept(true);
        setTimeLeft(null);
        setCountdown(null);
        return new Date();
      }

      const lastOrderDate = new Date(sorted[0].attributes.createdAt);
      const now = new Date();
      const diffInMs = now - lastOrderDate;

      const customWaitTime =
        updatedProvider?.attributes?.acceptOrderWaitHours ?? 12;
      const waitMs = customWaitTime * 60 * 60 * 1000;

      const remainingMs = waitMs - diffInMs;

      if (remainingMs > 0) {
        setTimeLeft(remainingMs);
        const h = Math.floor(remainingMs / (1000 * 60 * 60));
        const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const timeString = h > 0 ? `${h} ساعة و ${m} دقيقة` : `${m} دقيقة`;
        setCanAccept(false);
        setCountdown(timeString);

        return lastOrderDate;
      } else {
        setCanAccept(true);
        setTimeLeft(null);
        setCountdown(null);
        return lastOrderDate;
      }
    } catch (error) {
      setCanAccept(true);
      setCountdown(null);
      console.log("error checking last order time", error);
    }
  };

  useEffect(() => {
    if (!provider?.id) return;

    checkLastOrderTime();

    const interval = setInterval(() => {
      checkLastOrderTime();
    }, 15000);

    return () => clearInterval(interval);
  }, [provider?.id]);

  useEffect(() => {
    let interval;

    if (timeLeft && timeLeft > 0 && !canAccept) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (!prev || prev <= 0) {
            clearInterval(interval);
            setCountdown(null);
            setCanAccept(true);
            return null;
          }

          const updated = prev - 1000;

          const h = Math.floor(updated / (1000 * 60 * 60));
          const m = Math.floor((updated % (1000 * 60 * 60)) / (1000 * 60));
          const timeString = h > 0 ? `${h} ساعة و ${m} دقيقة` : `${m} دقيقة`;

          setCountdown(timeString);

          if (updated <= 2000) {
            checkLastOrderTime();
            clearInterval(interval);
            return null;
          }

          return Math.max(0, updated);
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeLeft, canAccept]);

  const handleOrderAccept = async (id) => {
    try {
      setModalIsLoading(true);
      setIsManuallyChecking(true);

      const lastAcceptedTime = await checkLastOrderTime();
      setIsManuallyChecking(false);

      if (lastAcceptedTime) {
        const now = new Date();
        const diffInHours = (now - lastAcceptedTime) / (1000 * 60 * 60);

        const updatedProvider = await getUserDataById(provider?.id);
        const customWaitTime =
          updatedProvider?.attributes?.acceptOrderWaitHours ?? 12;

        if (diffInHours < customWaitTime) {
          const remaining = Math.ceil(customWaitTime - diffInHours);
          setErrorMessage(t("must_wait_hours_left", { hours: remaining }));
          setModalIsLoading(false);
          setModalVisible(false);
          return;
        }
      }

      const userId = order?.user?.data?.id;
      const userNotificationToken =
        order?.user?.data?.attributes?.expoPushNotificationToken;
      const channel_id = createUniqueName(userId, provider?.id, id);
      const res = await acceptOrder(id, provider?.id, channel_id);
      if (res) {
        let userId = order?.user?.data?.id;
        let providerId = order?.provider;
        const res = await updateUserData(providerData?.id, {
          orders: {
            connect: [{ id: id }],
          },
        });
        if (res) {
          sendPushNotification(
            userNotificationToken,
            "قبول طلب",
            `تم قبول طلبك بواسطة ${provider?.attributes?.name}`,
            "user",
            userId,
            true
          );

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: t(MY_ORDERS) }],
            })
          );

          Toast.show({
            type: "success",
            text1: t("Done successfully"),
            position: "top",
          });

          // Close modal only on success
          setModalVisible(false);
        }
      } else {
        setErrorMessage(t("A problem occurred, try again."));
        // Keep modal open to show error
      }
    } catch (error) {
      console.log(error, "error accepting the order");

      if (error.message === "تم قبول الطلب من فني آخر") {
        setErrorMessage(t("order_already_accepted"));
      } else {
        setErrorMessage(t("order_accept_error"));
      }
      // Keep modal open to show error
    } finally {
      setModalIsLoading(false);
      setIsManuallyChecking(false);
      // Removed setModalVisible(false) from here
    }
  };

  const calculateDistance = () => {
    if (!order || !provider) return null;

    const orderLocation = {
      latitude: Number(order?.googleMapLocation?.coordinate?.latitude),
      longitude: Number(order?.googleMapLocation?.coordinate?.longitude),
    };

    const providerLocation = {
      latitude: Number(
        provider?.attributes?.googleMapLocation?.coordinate?.latitude
      ),
      longitude: Number(
        provider?.attributes?.googleMapLocation?.coordinate?.longitude
      ),
    };

    if (
      orderLocation.latitude &&
      orderLocation.longitude &&
      providerLocation.latitude &&
      providerLocation.longitude
    ) {
      return getDistanceKm(providerLocation, orderLocation, t);
    }
    return null;
  };

  const distance = calculateDistance();

  // Show skeleton while loading or no order data
  if (isLoading || !order) {
    return <OrderCardSkeleton />;
  }

  if (ModalisLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.orderCard}>
      {errorMessage && (
        <NotificationBanner
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          type="error"
        />
      )}

      <TouchableOpacity onPress={onPress} style={styles.cardHeader}>
        <View style={styles.headerContainer3}>
          {name && (
            <View style={styles.headerContainer}>
              <Image height={35} width={35} source={{ uri: imageUrl }} />
              <AppText
                text={name}
                style={[styles.header, { color: Colors.primaryColor }]}
                centered={true}
              />
            </View>
          )}

          {/* <View style={{ marginLeft: 'auto', marginBottom: -50 }}>
            <PriceTextComponent
              price={Math.round(order?.totalPrice * 1.15)}
              textStyle={{ fontSize: RFPercentage(2.2), fontWeight: 'bold' }}
              containerStyle={{
                backgroundColor: "transparent",
                padding: 6,
                paddingHorizontal: 14,
                borderRadius: 15,
                overflow: 'hidden'
              }}
            />
          </View> */}
        </View>

        {/* تفاصيل الطلب */}
        {(cartItemName || name) && (
          <View style={styles.headerContainer}>
            <MaterialIcons
              name="category"
              size={20}
              color={Colors.primaryColor}
            />
            <AppText
              text={cartItemName || name}
              style={[styles.content, { flexShrink: 1, marginLeft: 4 }]}
              centered={false}
            />
          </View>
        )}

        <View style={styles.headerContainer}>
          <MaterialIcons name="event" size={20} color={Colors.primaryColor} />
          <AppText
            text={convertDate(order?.date, language)}
            centered={false}
            style={[styles.content, { flexShrink: 1, marginLeft: 4 }]}
          />
        </View>

        <View style={styles.headerContainer}>
          <MaterialIcons
            name="location-on"
            size={20}
            color={Colors.primaryColor}
          />
          <AppText
            text={order?.[location]}
            centered={false}
            style={[styles.content, { flexShrink: 1, marginLeft: 4 }]}
          />
        </View>

        {/* التفاصيل من ItemScreen */}
        {order?.services?.data?.length > 0 ? (
          <View style={styles.headerContainer2}>
            {/* <AppText
              text="الخدمات"
              style={[styles.header, styles.wrapper]}
              centered={true}
            /> */}
            <SelectedServicesList
              currentSelectedServices={order?.services?.data}
            />
          </View>
        ) : order?.service_carts?.data?.length > 0 ? (
          <View style={styles.headerContainer}>
            <FontAwesome5 name="tools" size={20} color={Colors.primaryColor} />
            <AppText
              centered={false}
              style={[styles.content, { flexShrink: 1, marginLeft: 4 }]}
              text={order?.service_carts?.data
                ?.map(
                  (cart) =>
                    cart?.attributes?.service?.data?.attributes[ItemsName]
                )
                .join(" , ")}
            />
          </View>
        ) : null}

        {/* الملاحظات */}
        {order?.description && (
          <View style={styles.headerContainer}>
            <SimpleLineIcons
              name="note"
              size={20}
              color={Colors.primaryColor}
            />
            <AppText
              centered={false}
              style={[styles.content, { flexShrink: 1, marginLeft: 4 }]}
              text={order?.description}
            />
          </View>
        )}
        {/* المسافة */}
        {distance && (
          <View style={styles.headerContainer}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={20}
              color={Colors.primaryColor}
            />
            <AppText
              text={distance}
              centered={false}
              style={[
                styles.content,
                { color: Colors.primaryColor, fontWeight: "bold" },
              ]}
            />
          </View>
        )}

        {/* الصور */}
        {/* {order?.orderImages?.length > 0 && (
          <View style={styles.headerContainer2}>
            <AppText
              text="الصور المرفقة"
              style={[styles.header, styles.wrapper]}
              centered={true}
            />
            <OrderImagesComponent orderImages={order?.orderImages} />
          </View>
        )} */}
      </TouchableOpacity>

      {/* Children content for additional components */}
      {children && <View style={styles.childrenContainer}>{children}</View>}

      {/* Accept button section */}
      <View style={[styles.childrenContainer, { marginTop: 15 }]}>
        <CustomAcceptButton
          onPress={async () => {
            await handleOrderAccept(item.id);
          }}
          textKey="accept_offer"
          IconComponent={
            <MaterialIcons name="check-circle" size={20} color="white" />
          }
        />
      </View>
      {/* <AppModal
        isModalVisible={isModalVisible}
        message={<AppText text={"Confirm acceptance of the request"} style={{ maxWidth: width * 0.9 }} />}
        setModalVisible={setModalVisible}
        onPress={async () => {
          await handleOrderAccept(item.id);
          // لا تسكر المودال هنا مباشرة، خل العملية تتحكم
        }}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    width: width * 0.95, // أصغر شوي من 92% إلى 85%
    backgroundColor: "white",
    borderRadius: 8, // الزوايا أقل بروز
    marginBottom: 8, // مسافة أقل تحت كل كارد
    borderColor: "#ddd", // لون أفتح للحدود
    borderWidth: 1,
    paddingVertical: 8, // تقليل الفراغ الداخلي
    paddingHorizontal: 10,
    shadowColor: "#000", // إضافة ظل بسيط
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // للـ Android
  },
  cardHeader: {
    paddingVertical: 8, // تقليل من 10
    paddingHorizontal: 8, // تقليل من 10
  },
  childrenContainer: {
    paddingHorizontal: 8, // تقليل من 10
    paddingBottom: 8, // تقليل من 10
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 7, // تقليل من 4
    marginBottom: 4, // تقليل من 5
    gap: 8, // تقليل من 10
  },
  headerContainer3: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3, // تقليل من 4
    gap: 8, // تقليل من 10
  },
  headerContainer2: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    paddingVertical: 3, // تقليل من 4
    gap: 8, // تقليل من 10
  },
  header: {
    color: Colors.blackColor,
    fontSize: RFPercentage(1.8), // كان 2.1
  },
  wrapper: {
    backgroundColor: "transparent",
    color: Colors.primaryColor,
    paddingHorizontal: 12, // تقليل من 15
    borderRadius: 12, // تقليل من 15
    overflow: "hidden",
  },
  content: {
    color: Colors.blackColor,
    fontSize: 12,
    marginTop: 3,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  animatedView: {
    backgroundColor: "#333333",
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    borderRadius: Sizes.fixPadding + 5.0,
    paddingHorizontal: Sizes.fixPadding + 5.0,
    paddingVertical: Sizes.fixPadding,
    justifyContent: "center",
    alignItems: "center",
  },
});
