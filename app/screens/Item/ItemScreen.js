import {
  Alert,
  Dimensions,
  StyleSheet,
  View,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-virtualized-view";
import { RFPercentage } from "react-native-responsive-fontsize";

import { Colors } from "../../constant/styles";
import AppButton from "../../component/AppButton";
import { useDispatch, useSelector } from "react-redux";
import { CommonActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AppText from "../../component/AppText";
import useOrders, {
  acceptOrder,
  GetOrderData,
  useNearOrders,
  useOrder,
  usePendingOrders,
  useSingleOrder,
  getCurrentNearOrders,
  GetProvidersOrders,
} from "../../../utils/orders";
import {
  HOME,
} from "../../navigation/routes";
import PriceTextComponent from "../../component/PriceTextComponent";

import LoadingScreen from "../loading/LoadingScreen";
import AppModal from "../../component/AppModal";
import useNotifications from "../../../utils/notifications";
import ArrowBack from "../../component/ArrowBack";
import OrderImagesComponent from "../../component/orders/OrderImagesComponent";
import useNameInLanguage from "../../hooks/useNameInLanguage";
import CartListItemDetails from "./CartListItemDetails";
import SelectedServicesList from "../../component/orders/OrderDetails/SelectedServicesList";

import { updateUserData, getProviderById as getUserDataById } from "../../../utils/user";
import { useLanguageContext } from "../../context/LanguageContext";
import { convertDate } from "../../component/orders/DateOrderComponent";
import LocationTextComponent from "../../component/orders/LocationTextComponent";
import NotificationBanner from "../../component/NotificationBanner";

const { width, height } = Dimensions.get("screen");
export default function ItemScreen({ navigation, route }) {
  const { item } = route?.params;
  const providerData = useSelector((state) => state?.user?.userData)
  const [ModalisLoading, setModalIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [canAccept, setCanAccept] = useState(false);

  const [countdown, setCountdown] = useState(null);
  const [isManuallyChecking, setIsManuallyChecking] = useState(false);
  const provider = useSelector((state) => state?.user?.userData);

  const { t } = useTranslation();
  const { location } = useNameInLanguage()
  const { sendPushNotification } = useNotifications();
  const { language, direction } = useLanguageContext()
  const { data: orderFullData, isLoading } = useSingleOrder(item?.id)


  const createUniqueName = (userId, providerId, orderId) => {
    return `user_${userId}_provider_${providerId}_order_${orderId}`;
  };
  const checkLastOrderTime = async () => {
    try {
      setCanAccept(false); // قفل الزر مؤقت
      setCountdown(null);  // نظف العداد

      const updatedProvider = await getUserDataById(provider?.id);
      if (!updatedProvider) return;

      console.log("📦 updatedProvider", updatedProvider);
      console.log("🕓 acceptOrderWaitHours:", updatedProvider?.attributes?.acceptOrderWaitHours);

      const orders = await GetProvidersOrders(provider?.id);

      if (!orders || orders.length === 0) {
        console.log("🟢 فني جديد ما عنده ولا طلب => قبول مباشر");
        setCanAccept(true);
        setTimeLeft(null);
        setCountdown(null);
        return null;
      }

      const sorted = orders
        .filter(order =>
          ["assigned", "working", "payment_required", "finished"].includes(order?.attributes?.status)
        )
        .sort((a, b) =>
          new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
        );

      // إذا لم توجد طلبات مقبولة، اسمح بالقبول
      if (sorted.length === 0) {
        console.log("🟢 لا يوجد طلبات مقبولة => قبول مباشر");
        setCanAccept(true);
        setTimeLeft(null);
        setCountdown(null);
        return new Date();
      }

      const lastOrderDate = new Date(sorted[0].attributes.createdAt);
      const now = new Date();
      const diffInMs = now - lastOrderDate;

      const customWaitTime = updatedProvider?.attributes?.acceptOrderWaitHours ?? 12;
      const waitMs = customWaitTime * 60 * 60 * 1000;

      const remainingMs = waitMs - diffInMs;

      if (remainingMs > 0) {
        setTimeLeft(remainingMs);
        const h = Math.floor(remainingMs / (1000 * 60 * 60));
        const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const timeString = h > 0 ? `${h} ساعة و ${m} دقيقة` : `${m} دقيقة`;
        setCanAccept(false);
        setCountdown(timeString);

        console.log("⏱ Remaining MS:", remainingMs, "formatted:", timeString);

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

          // توليد النص
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

      // Check last order time before proceeding
      const lastAcceptedTime = await checkLastOrderTime();
      setIsManuallyChecking(false);

      if (lastAcceptedTime) {
        const now = new Date();
        const diffInHours = (now - lastAcceptedTime) / (1000 * 60 * 60);

        const updatedProvider = await getUserDataById(provider?.id);
        const customWaitTime = updatedProvider?.attributes?.acceptOrderWaitHours ?? 12;

        console.log("🔁 final waitHours from provider:", customWaitTime);

        if (diffInHours < customWaitTime) {
          const remaining = Math.ceil(customWaitTime - diffInHours);
          setErrorMessage(
            t("must_wait_hours_left", { hours: remaining })
          );
          setModalIsLoading(false);
          setModalVisible(false);
          return;
        }
      }

      const userId = orderFullData?.attributes?.user?.data?.id;
      const userNotificationToken =
        orderFullData?.attributes?.user?.data?.attributes
          ?.expoPushNotificationToken;
      const channel_id = createUniqueName(userId, provider?.id, id);
      const res = await acceptOrder(id, provider?.id, channel_id);
      if (res) {
        navigation.goBack();
        navigation.goBack();
        let userId = orderFullData?.attributes?.user?.data?.id
        let providerId = orderFullData?.attributes?.provider
        const res = await updateUserData(providerData?.id, {
          orders: {
            connect: [{ "id": id }]
          }
        })
        if (res) {

          sendPushNotification(
            userNotificationToken,
            "قبول طلب",
            `تم قبول طلبك بواسطة ${provider?.attributes?.name}`,
            'user', userId, true
          );

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: t(HOME) }],
            })
          );

          Alert.alert(t("Done successfully"), "", [{ text: t('Ok') }]);
        }
      } else {
        setErrorMessage(t('A problem occurred, try again.'));
      }
    } catch (error) {
      console.log(error, "error accepting the order");

      if (error.message === "تم قبول الطلب من فني آخر") {
        setErrorMessage(t("order_already_accepted"));
      } else {
        setErrorMessage(t("order_accept_error"));
      }
    } finally {
      setModalIsLoading(false);
      setModalVisible(false);
      setIsManuallyChecking(false);
    }
  };
  if (isLoading) {
    return <LoadingScreen />
  }
  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {errorMessage && (
        <NotificationBanner
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          type="error"
        />
      )}
      {ModalisLoading ? (
        <View style={styles.container2}>
          <LoadingScreen />
        </View>
      ) : (
        <>
          <ArrowBack />
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {orderFullData?.attributes?.services?.data?.length > 0 ? (
              <SelectedServicesList currentSelectedServices={orderFullData?.attributes?.services?.data} />
            ) : (orderFullData?.attributes?.service_carts?.data?.length > 0) ?
              <CartListItemDetails item={orderFullData} /> : (
                null
              )}
            <View>
              <AppText
                centered={true}
                text={orderFullData?.attributes?.service?.data?.attributes?.name}
                style={styles.name}
              />
            </View>
            <View style={styles.itemContainer}>
              <AppText centered={true} text={"Price"} style={styles.title} />
              <PriceTextComponent
                style={{
                  color: Colors.blackColor,
                  fontSize: RFPercentage(1.8),
                  marginTop: 4,
                }}
                price={orderFullData?.attributes?.totalPrice}
              />
            </View>
            <LocationTextComponent location={orderFullData?.attributes[location]} />
            <View style={styles.itemContainer}>
              <AppText centered={true} text={"Date"} style={styles.title} />
              <AppText
                text={convertDate(orderFullData?.attributes?.date, language)}
                centered={true}
                style={[styles.price, {
                  writingDirection: direction
                }]}
              />
            </View>
            {orderFullData?.attributes?.description && (
              <View style={styles.descriptionContainer}>
                <AppText
                  centered={true}
                  text={"Notes"}
                  style={styles.title}
                />
                <AppText
                  centered={true}
                  text={
                    orderFullData?.attributes?.description
                      ? orderFullData?.attributes?.description
                      : "No Data"
                  }
                  style={[styles.price, { minWidth: width * 0.85, textAlign: 'left' }]}
                />
              </View>
            )}
            {orderFullData?.attributes?.orderImages?.length > 0 && (
              <OrderImagesComponent orderImages={orderFullData?.attributes?.orderImages} />
            )}

            {/* Add debug log before button */}
            {console.log("🧪 زر القبول | canAccept:", canAccept, "| countdown:", countdown)}

            <AppButton
              title={"accept offer"}
              onPress={() => setModalVisible(true)}
            />


            {/* عرض رسالة الانتظار للمستخدم
            {!canAccept && (
              <View style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                backgroundColor: "#FFF5F5",
                borderColor: Colors.dangerColor,
                borderWidth: 1,
              }}>
                <AppText
                  text={
                    countdown
                      ? t("accept after countdown", { time: countdown })
                      : t("accept after countdown", { time: "..." })
                  }
                  style={{ fontSize: RFPercentage(1.8), color: Colors.blackColor }}
                />
              </View>
            )} */}



          </ScrollView>
          <AppModal
            isModalVisible={isModalVisible}
            message={<AppText text={"Confirm acceptance of the request"} style={{ maxWidth: width * 0.9 }} />}
            setModalVisible={setModalVisible}
            onPress={() => handleOrderAccept(orderFullData.id)}
          />
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    height: "100%",
    backgroundColor: Colors.whiteColor,
  },
  container: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  container2: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    display: "flex",
    alignItems: "center",
    height: height,
  },
  name: {
    fontSize: RFPercentage(1.7),
    color: Colors.blackColor,
  },
  itemContainer: {
    display: "flex",
    height: "auto",
    flexDirection: "row",
    alignItems: "center",
    width: width * 0.9,
    padding: 10,
    // borderWidth: 0.7,
    borderRadius: 10,
    // overflow:"hidden",

    marginVertical: 10,
    backgroundColor: Colors.whiteColor,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 3,
  },
  descriptionContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "auto",
    width: width * 0.9,
    padding: 10,
    // borderWidth: 0.7,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: Colors.whiteColor,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  price: {
    fontSize: RFPercentage(1.9),
    color: Colors.blackColor,
    marginTop: 5,
  },
  title: {
    fontSize: RFPercentage(2.3),
    color: Colors.primaryColor,
  },
  location: {
    fontSize: RFPercentage(1.7),
    color: Colors.blackColor,
    // marginTop: 5,
    paddingHorizontal: 10,
    textAlign: 'left',
    minWidth: width * 0.8,
    // backgroundColor:'red'
  }
  ,
  CartServiceStylesContainer: {
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 0.5,
    padding: 5,
    borderRadius: 10,
    // height:100,
    // width:100,
    gap: 4,
    backgroundColor: Colors.piege,
    borderColor: Colors.whiteColor
  }
});

