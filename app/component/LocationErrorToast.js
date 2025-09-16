import { View, Text, Dimensions } from 'react-native'
import React, { useEffect } from 'react'
import UseLocation from '../../utils/useLocation'
import { Colors } from 'stream-chat-expo'
import AppText from './AppText'
import { RFPercentage } from 'react-native-responsive-fontsize'
import AppButton from './AppButton'
import * as Updates from 'expo-updates'
const { width , height }  = Dimensions.get('screen')
export default function LocationErrorToast() {
    const {location} = UseLocation()
    useEffect(()=>{
        checkForLocationEnabled()
    },[location])

    const checkForLocationEnabled = ()=>{
        console.log("location is *******************",location)
    }
    if(location !== null) return null
  return (
    <View style={{backgroundColor:"red",height:"auto",paddingVertical:10}}>
     <AppText text={"To provide you with the best service, our app needs access to your location."} style={{fontSize:RFPercentage(1.9),textAlign:'center',maxWidth:width*0.9}}/>
     <AppButton title={"Confirm" } style={{marginVertical:10,width:width*0.5,alignSelf:'center',}} textStyle={{fontSize:RFPercentage(2)}} onPress={()=>Updates.reloadAsync()}/>
    </View>
  )
}