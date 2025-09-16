import {

  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { memo } from "react";
import OrderImagesComponent from "../OrderImagesComponent";
import CurrentOrderOrderAction from "./CurrentOrderOrderAction";
import CurrentOrderDetailsComponentWrapper from "./CurrentOrderDetailsComponentWrapper";


const CurrentOrderDetailsInfo = ({ item,handleOrderCancle,setIsLoading }) => {

 
  if(!item) return null ;
  return (
    <View>
      <CurrentOrderDetailsComponentWrapper item={item}/>
      <OrderImagesComponent orderImages={item?.attributes?.orderImages} />  
      <CurrentOrderOrderAction item={item} 
      handleOrderCancle={handleOrderCancle}  
      // setIsLoading={setIsLoading}
      /> 

        </View>
  )
}

export default memo(CurrentOrderDetailsInfo)
