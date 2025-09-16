import {
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
  } from "react-native";
  import React, { useState } from "react";
  import AppButton from "../../component/AppButton";
  import AppText from "../../component/AppText";
  import { Colors } from "../../constant/styles";
  import { RFPercentage } from "react-native-responsive-fontsize";

  import useOrders, { acceptOrder, cancleOrder, changeOrderStatus, finishOrder, requestPayment } from "../../../utils/orders";
  import { useDispatch, useSelector } from "react-redux";
  import { setOrders } from "../../store/features/ordersSlice";
  import LoadingModal from "../../component/Loading";
  import { CURRENCY, HOME, OFFERS, ORDERS, RATE_CLIENT_sSCREEN } from "../../navigation/routes";
  import PriceTextComponent from "../../component/PriceTextComponent";
  import { Image } from "react-native";
  import { ScrollView } from "react-native-virtualized-view";
  import LoadingScreen from "../loading/LoadingScreen";
  import { color } from "@rneui/base";
  import AppModal from "../../component/AppModal";
  import { CommonActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ArrowBack from "../../component/ArrowBack";
import CartListItemDetails from "../Item/CartListItemDetails";
import CurrentOrderDetailsInfo from "../../component/orders/OrderCard/CurrentOrderDetailsInfo";
import SelectedServicesList from "../../component/orders/OrderDetails/SelectedServicesList";
  
  const { width ,height} = Dimensions.get("screen");
  export default function CompletedOrderDetails({ navigation, route }) {
    const item = route?.params?.item;
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const { t } = useTranslation()
  const handleOrderCancle = async (id) => {
    try {
      const res = await cancleOrder(id);
      if (res) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: t(HOME)}],
        })
      )
      Alert.alert(t("Done successfully"),"",[{text:t('Ok')}]);
    } else {
        Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);
      }
    } catch (error) {
      console.log(error, "error deleting the order");
    } finally {
      // setIsLoading(false);
      setModalVisible(false)
    }
  };
  const handleFinishOrder = async (id) => {
    try {
      const res = await changeOrderStatus(id,"finished")
      if (res) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: t(HOME)}],
        })
      )
      Alert.alert(t("Done successfully"),"",[{text:t('Ok')}]);
    } else {
        Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);
      }
    } catch (error) {
      console.log(error, "error finsihed the order");
    } finally {
      setModalVisible(false)
    }
  };
  const handleRequestPayment = async (id) => {
    try {
      const res = await requestPayment(id)
      if (res) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: t(HOME)}],
        })
      )
      Alert.alert(t("Done successfully"),"",[{text:t('Ok')}]);
    } else {
        Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);
      }
    } catch (error) {
      console.log(error, "error finsihed the order");
    } finally {
      setModalVisible(false)
    }
  };
  
    if(isLoading) return <LoadingScreen/>
    return (
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <ArrowBack />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SelectedServicesList currentSelectedServices={item?.attributes?.services.data}/>
        <SelectedServicesList currentSelectedServices={item?.attributes?.packages.data}/>
          <CartListItemDetails item={item} /> 
          <CurrentOrderDetailsInfo item={item}/>

    {/* {(item?.attributes?.provider_payment_status === "payed" && item?.attributes?.providerOrderRating === null ) && (
          <AppButton
            title={"Rate"}
            style={{ backgroundColor: Colors.success }}
            onPress={() =>navigation.navigate(RATE_CLIENT_sSCREEN,{orderID:item?.id})}
          />
        )} */}
        </ScrollView>
        <LoadingModal visible={isLoading} />
        <AppModal isModalVisible={isModalVisible} 
        message={<AppText text={"تأكيد رفض الطلب"}/>}
        setModalVisible={setModalVisible} onPress={()=> handleOrderCancle(item.id)}/>
      </ScrollView>
    );
  }
  const styles = StyleSheet.create({
    scrollContainer:{
      height: "100%",
      backgroundColor: Colors.whiteColor,
  
    },
    container: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      
    },
    name: {
      fontSize: RFPercentage(1.8),
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
      shadowColor: '#000',
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
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    price: {
      fontSize: RFPercentage(1.8),
      color: Colors.blackColor,
      marginTop: 5,
    },
    title: {
      fontSize: RFPercentage(2.3),
      color: Colors.primaryColor,
    },
    location:{
      fontSize: RFPercentage(1.7),
      color: Colors.blackColor,
      marginTop: 5,
      paddingHorizontal:10,
      minWidth:width*0.8,
      // backgroundColor:'red'
    },
    CartServiceStylesContainer:{
      display:'flex',
    flexDirection:'row',
    borderWidth:0.5,
   
    padding:5,
    borderRadius:10,
    // height:100,
    // width:100,
    gap:4,
    backgroundColor:Colors.piege,
    borderColor:Colors.grayColor}
  });
  
  