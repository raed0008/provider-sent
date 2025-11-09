import { Alert, Dimensions, View, Text } from "react-native";
import React, { memo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "../../AppButton";
import AppModal from "../../AppModal";
import { useRoute } from "@react-navigation/native";

import AppText from "../../AppText";
import FloatTextInput from "../../FloatTextInput";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ADD_ADDITIONAL_SERVICES_SCREEN,
  CHANGE_ORDER_DATE,
  HOME,
  PAY_AFTER_SERVICES_SCREEN,
  RATE_CLIENT_sSCREEN,
  CANCEL_ORDER_SCREEN,
} from "../../../navigation/routes";
import { Colors } from "../../../constant/styles";
import useNotifications from "../../../../utils/notifications";
import useOrders, {
  changeOrderStatus,
  requestPayment,
  useSingleOrder,
} from "../../../../utils/orders";
import { setOrders } from "../../../store/features/ordersSlice";
import { RFPercentage } from "react-native-responsive-fontsize";
import ButtonActionsComponent from "./ButtonActionsComponent";
import { fetchData } from "../../../screens/home/helpers";
import { generateUserToken } from "../../../screens/chat/chatconfig";
import {
  setUserData,
  setUserStreamData,
  userRegisterSuccess,
} from "../../../store/features/userSlice";
import LoadingScreen from "../../../screens/loading/LoadingScreen";
import Toast from "react-native-toast-message";

const ButtonActionsContainer = ({
  handleOrderCancle,
  item,
  seeAdditaionPricePage,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const cancelled = route.params?.cancelled;

  // const [isModalVisible, setModalVisible] = useState(false);
  // const [cancelReason, setCancelReason] = useState("");
  const { t } = useTranslation();

  const provider = useSelector((state) => state?.user?.userData);
  const { sendPushNotification, token } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  const { data: selectedOrder, refetch } = useSingleOrder(item?.id);

  const handleStartWorking = useCallback(
    async (id) => {
      try {
        setIsLoading(true);

        // ✅ أول شي ينقل للشاشة مباشرة
        navigation.navigate(PAY_AFTER_SERVICES_SCREEN, {
          orderID: id,
          item: selectedOrder,
        });

        // بعدين ينفذ التغيير بالخلفية
        const res = await changeOrderStatus(id, "working");

        if (res) {
          const userNotificationToken =
            selectedOrder?.attributes?.user?.data?.attributes
              ?.expoPushNotificationToken;

          if (userNotificationToken) {
            let userId = selectedOrder?.attributes?.user?.data?.id;
            sendPushNotification(
              userNotificationToken,
              ` قام ${provider?.attributes?.name} ببدء العمل على الطلب`,
              "",
              "user",
              userId,
              true
            );
          }

          await refetch();

          Toast.show({
            text1: t("Done successfully start work"),
            type: "success",
          });
        } else {
          Toast.show({
            text1: t("A problem occurred, try again."),
            type: "error",
          });
        }
      } catch (error) {
        console.log(error, "error started working");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedOrder, provider, refetch, navigation]
  );

  const handleRequestPayment = useCallback(
    async (id) => {
      try {
        setIsLoading(true);
        const res = await requestPayment(id);
        if (res) {
          await refetch(); // 🔹 يحدث البيانات على نفس الصفحة

          // navigation.dispatch(CommonActions.reset({
          //     index: 0,
          //     routes: [{ name: t(HOME) }],
          // }));
          // await handleFetchNewData()

          Toast.show({
            text1: t("Done successfully finish work"),
            type: "success",
          });
        } else {
          Toast.show({
            text1: t("A problem occurred, try again."),
            type: "error",
          });
        }
      } catch (error) {
        console.log(error, "error requested payment");
      } finally {
        // setModalVisible(false);
      }
    },
    [refetch]
  );

  const orderData = selectedOrder || item;

  return (
    <View>
      {/* Rate ORder */}

      <ButtonActionsComponent
        conditionRender={
          orderData?.attributes?.provider_payment_status === "payed" &&
          orderData?.attributes?.providerOrderRating === null
        }
        title={"Rate and Finish Work"}
        style={{ backgroundColor: Colors.success }}
        onPress={() =>
          navigation.navigate(RATE_CLIENT_sSCREEN, { orderID: orderData?.id })
        }
      />

      {/* Request payment  */}
      {!seeAdditaionPricePage && (
        <ButtonActionsComponent
          conditionRender={
            orderData?.attributes?.status === "finish_work" &&
            orderData?.attributes?.provider_payment_status === "pending"
          }
          title={"Request Payment"}
          style={{ backgroundColor: Colors.success }}
          onPress={() =>
            orderData?.attributes?.totalPrice > 0
              ? handleRequestPayment(orderData?.id)
              : navigation.navigate(PAY_AFTER_SERVICES_SCREEN, {
                  orderID: orderData?.id,
                })
          }
        />
      )}

      {/* start Work */}
      <ButtonActionsComponent
        title={"Start Work"}
        style={{ backgroundColor: Colors.success }}
        onPress={() => handleStartWorking(orderData.id)}
        conditionRender={orderData?.attributes?.status === "accepted"}
      />

      <ButtonActionsComponent
        title={"Reactivate and Start Working"}
        style={{ backgroundColor: Colors.success }}
        conditionRender={
          orderData?.attributes?.status === "delayed" &&
          orderData?.attributes?.delay_request?.data?.attributes?.accepted ===
            "true"
        }
        onPress={() => handleStartWorking(orderData.id)}
      />
      {/* finish working  */}
      {/* {!seeAdditaionPricePage && (
        <ButtonActionsComponent
          conditionRender={orderData?.attributes?.status === "working"}
          title={"Finish Work and Request Payment"}
          style={{ backgroundColor: Colors.success }}
          textStyle={{ fontSize: RFPercentage(2) }}
          onPress={() => {
            // handleFinishOrder(orderData.id)
            orderData?.attributes?.totalPrice > 0
              ? handleRequestPayment(orderData?.id)
              : navigation.navigate(PAY_AFTER_SERVICES_SCREEN, {
                  orderID: orderData?.id,
                });
          }}
        />
      )} */}
      {/* sttart working */}
      {(orderData?.attributes?.status === "assigned" ||
        orderData?.attributes?.status === "cancel_request") && (
        <View>
          <AppButton
            title={isLoading ? "loading..." : "Start Work"}
            style={{ backgroundColor: Colors.success }}
            onPress={() => handleStartWorking(orderData.id)}
            disabled={isLoading}
          />

          {orderData?.attributes?.status === "assigned" && !cancelled && (
            <AppButton
              title={"Reject Order"}
              style={{ backgroundColor: Colors.redColor }}
              onPress={() =>
                navigation.navigate(CANCEL_ORDER_SCREEN, {
                  orderId: orderData?.id,
                  refetch,
                  from: route.name,
                  providerId: provider?.id || provider?.attributes?.id,
                })
              }
            />
          )}

          {orderData?.attributes?.delay_request?.data === null && (
            <AppButton
              title={"Request Date Change"}
              style={{ backgroundColor: Colors.success }}
              onPress={() =>
                navigation.navigate(CHANGE_ORDER_DATE, {
                  item: orderData,
                  orderId: orderData?.id,
                })
              }
            />
          )}
        </View>
      )}

      {/* Add additional prices */}
      {(orderData?.attributes?.status === "finish_work" ||
        orderData?.attributes?.status === "working") &&
        orderData?.attributes?.provider_payment_status === "pending" && (
          <AppButton
            title={"Finish Work and Request Payment"} // ثابت وما يتغير
            style={{ backgroundColor: Colors.success }}
            textStyle={{ fontSize: RFPercentage(2.1) }}
            onPress={() =>
              navigation.navigate(PAY_AFTER_SERVICES_SCREEN, {
                orderID: orderData?.id,
                item: selectedOrder,
              })
            }
          />
        )}

      {/* ✅ يظهر فقط إذا كانت الحالة payment_required */}
      {orderData?.attributes?.status === "change_price" && (
        <AppButton
          title={"تعديل السعر بعد بدء العمل"}
          style={{ backgroundColor: Colors.success, marginTop: 10 }}
          textStyle={{ fontSize: RFPercentage(2.1) }}
          onPress={() =>
            navigation.navigate(PAY_AFTER_SERVICES_SCREEN, {
              orderID: orderData?.id,
              item: selectedOrder,
            })
          }
        />
      )}
    </View>
  );
};

export default memo(ButtonActionsContainer);
