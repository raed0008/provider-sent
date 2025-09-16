// RequiredLocationScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import * as Network from 'expo-network';
import * as Updates from "expo-updates";
import { Colors } from 'stream-chat-expo';
import AppText from '../component/AppText';
import AppButton from '../component/AppButton';
import LottieView from "lottie-react-native";
import * as Font from "expo-font";
import { ActivityIndicator } from 'react-native-paper';
import { RFPercentage } from 'react-native-responsive-fontsize';
import UserLocation from '../component/Home/UserLocation';
import UseLocation from '../../utils/useLocation';

const { width , height }=Dimensions.get('screen')
const RequiredLocationScreen = ({navigation}) => {
    const onLocationPermissionGranted = () => {
        navigation.goBack(); // Navigate back
     };
  return (
    <View style={styles.container}>
       <LottieView
        autoPlay
        style={{
          width: width*0.3,
          height: height*0.3,
        }}
        source={require("../assets/LocationRequired.json")}
      />
      <AppText 
        text={"لكي تتمكن من استقبال الطلبات والوصول إلى العملاء الأقرب لك، يرجى تعيين إذن الموقع ليكون (قيد الاستخدام دائمًا)"}

       style={{color:Colors.black,letterSpacing:2,marginVertical:10,textAlign:'center',fontSize:RFPercentage(1.8)}}/>
     <AppButton title="Allow" onPress={()=>navigation.goBack()}/>
     
        <UseLocation onLocationPermissionGranted={onLocationPermissionGranted}/>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign:"center",
    backgroundColor:Colors.white_snow
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default RequiredLocationScreen;