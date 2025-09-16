import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from "react-redux";
import { CommonActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-virtualized-view";


import AppText from "../../component/AppText";
import { Colors } from "../../constant/styles";
import useOrders, {
  cancleOrder,
  GetOrderData,
  changeOrderStatus,
  useSingleOrder,
} from "../../../utils/orders";
import Toast from "react-native-toast-message";
import { setOrders } from "../../store/features/ordersSlice";
import { HOME } from "../../navigation/routes";
import LoadingScreen from "../loading/LoadingScreen";
import AppModal from "../../component/AppModal";
import useNotifications from "../../../utils/notifications";
import ArrowBack from "../../component/ArrowBack";
import CartListItemDetails from "../Item/CartListItemDetails";
import CurrentOrderDetailsInfo from "../../component/orders/OrderCard/CurrentOrderDetailsInfo";
import SelectedServicesList from "../../component/orders/OrderDetails/SelectedServicesList";
import { updateUserData } from "../../../utils/user";

const { width, } = Dimensions.get("screen");
export default function OrderDetails({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(route?.params?.item)
  const item = route?.params?.item
  const { t } = useTranslation()
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { data: selectedOrder, refetch } = useSingleOrder(item?.id);

  const provider = useSelector((state) => state?.user?.userData);
  const { sendPushNotification } = useNotifications();

  const handleOrderCancle = async (id, reason) => {
    try {
      setIsLoading(true);
      console.log("🚀 إرسال طلب الإلغاء");
      console.log("ID:", id);
      console.log("السبب:", reason);

      const res = await changeOrderStatus(id, "cancel_request", {
        providerCancelReason: reason,
      });

      console.log("📦 رد الباك اند:", res);

      if (res) {
        Toast.show({
          text1: t("تم إرسال طلب الإلغاء بنجاح"),
          type: "success",
        });
        await refetch();
      } else {
        Toast.show({
          text1: t("حدث خطأ حاول مرة أخرى"),
          type: "error",
        });
      }
    } catch (error) {
      console.log("❌ error requesting cancel", error);
    } finally {
      setIsLoading(false);
      setModalVisible(false);
    }
  };


  if (!route?.params?.item || isLoading) return <LoadingScreen />;
  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <ArrowBack />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SelectedServicesList currentSelectedServices={item?.attributes?.services?.data} />
        <SelectedServicesList currentSelectedServices={item?.attributes?.packages?.data} type="package" />
        <CartListItemDetails item={item} />
        <CurrentOrderDetailsInfo
          setIsLoading={setIsLoading}
          item={item} handleOrderCancle={handleOrderCancle} />

      </ScrollView>
      {
        isLoading && <LoadingScreen />
      }
      {/* <AppModal
        isModalVisible={isModalVisible}
        message={<AppText
          style={{ maxWidth: width * 0.9 }}
          text={"Confirm acceptance of the request"} />}
        setModalVisible={setModalVisible}
        onPress={() => handleOrderCancle(item?.id, cancelReason)}
      /> */}
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
    // backgroundColor:'red'
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
  location: {
    fontSize: RFPercentage(1.7),
    color: Colors.blackColor,
    marginTop: 5,
    paddingHorizontal: 10,
    minWidth: width * 0.8,
    // backgroundColor:'red'
  },
  title: {
    fontSize: RFPercentage(2.3),
    color: Colors.primaryColor,
  },
  chatContainer: {
    paddingHorizontal: 19,
    backgroundColor: Colors.primaryColor,
    width: 60,
    height: 40,
    borderRadius: 20,
    marginHorizontal: width * 0.8,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    fontSize: RFPercentage(1.8),
    color: Colors.blackColor,
    marginTop: 5,
    paddingHorizontal: 10,
    minWidth: width * 0.85,
    // backgroundColor:'red'
  },
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
