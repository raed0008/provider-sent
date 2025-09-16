// NoConnectionScreen.js

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
import ContactUsModal from '../component/Account/ContactUsModal';

const { width , height }=Dimensions.get('screen')
const InactiveAccountScreen = () => {
  
  const [visible, setVisible] = useState(false);

  const hideModal = () => setVisible(false);


  return (
    <View style={styles.container}>
       <LottieView
        autoPlay
        // loop={false}
        // ref={animation}
        style={{
          width: width*0.2,
          height: height*0.2,
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require("../assets/InactiveAccount.json")}
      />
      <AppText text={ 'The account is not activated.'} style={{color:Colors.black,letterSpacing:2,marginVertical:10}}/>
      <AppText text={"To activate your account, please contact us."} style={{textAlign:'center',marginVertical:10,color:Colors?.black}}/>
       <AppButton title="Reactivate" onPress={()=>setVisible(true)} />
       <ContactUsModal hideModal={hideModal} visible={visible}/>     

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

export default InactiveAccountScreen;
