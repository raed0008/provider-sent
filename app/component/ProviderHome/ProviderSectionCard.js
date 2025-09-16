import { View, TouchableWithoutFeedback, Dimensions } from "react-native";
import React, { useEffect, useState,memo, useCallback } from "react";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import * as geolib from "geolib";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderTextComponent from "../Home/HeaderTextComponent";
import { SUPORTED_DISTANCE } from "../../navigation/routes";
import { Colors, Fonts } from "../../constant/styles";
import AppText from "../AppText";
import LocationAgreamentComponent from "../LocationAgreamentComponent";
import moment from "moment";
import 'moment/locale/ar';  // Import Arabic locale
import { getNearOrders, GetProvidersOrders, useCurrentOrders, useNearOrders } from "../../../utils/orders";

const { width, height } = Dimensions.get("screen");
const  ProviderSectionCard = ({ enableRefetch,setRefetching}) => {

  return (
    <View >
      <HeaderTextComponent name={"Overview"} showAll={false}>
        <View style={styles.card}>
         <CurrentOfferComponent enableRefetch={enableRefetch} setRefetching={setRefetching}/>
        <NearOrderComponent enableRefetch={enableRefetch} setRefetching={setRefetching}/>
        </View>
      </HeaderTextComponent>
    </View>
  );
}
export default memo(ProviderSectionCard)
const styles = StyleSheet.create({
  card: {
    minHeight: height * 0.15,
    width: width * 0.9,
    paddingVertical: 20,
    backgroundColor: Colors.bodyBackColor,
    borderRadius: 10,
    flex: 1,
    alignSelf: "center",
    borderWidth:1,
    borderColor:Colors.grayColor,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginTop: 10,
    justifyContent: "center",
    elevation: 3,
  },
  ballContainer: {
    backgroundColor: Colors.whiteColor,
    height: height*0.075, // Example using percentage
    width:  height*0.08, // Should match the height to maintain aspect ratio
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.primaryColor,
    borderWidth: 2,
    // Set the borderRadius to half of the width or height
    borderRadius: height*0.075*0.5, 
    outline: "blue",
    paddingHorizontal: 5,
   },
   
  text: {
    color: Colors.grayColor,
    // ...Fonts.grayColor14Medium
  },
  text2: {
    color: Colors.primaryColor,
    fontSize:20
    // ...Fonts.grayColor14Medium
  },
  text3: {
    color: Colors.grayColor,
    // includeFontPadding:14
    // letterSpacing:10,
    
    // ...Fonts.grayColor14Medium
  },
  show: {
    fontSize: 17,
  },
  imageCard: {
    height: 40,
    width: 40,
  },
  ItemContainer: {
    display: "flex",
    gap: 10,
    // justifyContent:'center',
    flexDirection: "row",
    // backgroundColor:'red',
    marginBottom: 10,
    alignItems: "center",
  },
  container2: {
    display: "flex",
    justifyContent: "flex-start",
  },
});

const CurrentOfferComponent = ({
  enableRefetch,
  setRefetching
})=>{

  const user = useSelector((state) => state?.user?.userData);
const {data,refetch,isLoading} = useCurrentOrders(user?.id,'all')
useEffect(()=>{
refetch()
setRefetching(false)
},[enableRefetch])
  return (
    <View style={styles.ItemContainer}>
    <View style={styles?.ballContainer}>
      <AppText text={data?.length} style={styles.text2} />
    </View>
    <View>
      <AppText
        text={"Accepted Orders"}
        style={styles.text}
        centered={true}
      />
    </View>
  </View>
  )
}

const NearOrderComponent = ({
  enableRefetch,
  setRefetching
})=>{
  const [currentOffers, setCurrentOffers] = useState(0);
  const user = useSelector((state) => state?.user?.userData);
  const {data,refetch} = useNearOrders(user?.id)

  useEffect(() => {
    
    refetch()
    if(data){
      console.log('inside the near order ....',data?.length,user?.id)
      setCurrentOffers(data?.length);
    }
    setRefetching(false)
  }, [data,enableRefetch]);

 
  return(
    <View style={styles.ItemContainer}>
    <View style={styles?.ballContainer}>
      <AppText text={currentOffers} style={styles.text2} />
    </View>
    <View style={styles.container2}>
      <AppText
        text={"Incoming offers"}
        style={styles.text3}
        centered={true}
      />
    </View>
  </View>
  )
}