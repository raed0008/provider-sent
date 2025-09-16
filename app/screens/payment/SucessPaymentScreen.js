import React, { useEffect, useState } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import AppButton from "../../component/AppButton";
import useOrders from "../../../utils/orders";
import { useDispatch } from "react-redux";
import { setOrders } from "../../store/features/ordersSlice";
import useNotifications from "../../../utils/notifications";
import { REVIEW_ORDER_SCREEN } from "../../navigation/routes";

export default function PaymentSucessScreen({navigation,route}) {
  const dispatch = useDispatch()
  const { item }= route?.params
  const {sendPushNotification,token}=useNotifications()
// console.log(item)
  const handleReturn = ()=> {

      navigation.navigate(REVIEW_ORDER_SCREEN, {
        orderID: item?.id,
        item: item,
        firstReview:true
      })
    
  
  }
  
  
  return (
       <View style={{ backgroundColor: "white", alignItems: "center",height:"100%" ,display:'flex',
       alignItems:'center',justifyContent:'center'}}>
      <LottieView
        autoPlay
        loop={false}
        // ref={animation}
        style={{
          width: 200,
          height: 200,
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require('../../assets/success.json')}
      />

        <AppButton title={"تقييم"} onPress={()=>handleReturn()} />
      </View>
  )
}