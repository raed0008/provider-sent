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

const { width , height }=Dimensions.get('screen')
const NoConnectionScreen = () => {
  const [hasInternet, setHasInternet] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  const checkInternet = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      setHasInternet(networkState.isConnected);
    } catch (error) {
      console.error('Error checking internet connection:', error);
    }
  };

  useEffect(() => {
    checkInternet();
  }, []);

  const handleRetry = async () => {
    try{

      if (hasInternet) {
        // Reload the app
        await Updates.reloadAsync();
      }
      // Otherwise, do nothing
    }catch(err){
      console.log("error reload ing app",err)
    }
  };

  useEffect(() => {
     async function loadFont() {
       try {
         await Font.loadAsync({
           "Mukta_Light": require("../assets/fonts/mukta/Mukta-Light.ttf"),
           "Mukta_Medium": require("../assets/fonts/mukta/Mukta-Medium.ttf"),
           "Mukta_Regular": require("../assets/fonts/mukta/Mukta-Regular.ttf"),
           "Ember_Light": require("../assets/fonts/Ember/Amazon-Ember-Light.ttf"),
           "Ember_Medium": require("../assets/fonts/Ember/Amazon-Ember-Medium.ttf"),
           "Ember_Regular": require("../assets/fonts/Ember/Amazon-Ember.ttf"),
           "Janna-Lt": require("../assets/fonts/Janna-LT-Bold.ttf"),
         });
         setFontLoaded(true);
       } catch (error) {
         console.log("Error loading fonts:", error);
       }
     }
       loadFont();
     }, [fontLoaded]);

     if(!fontLoaded) return <ActivityIndicator/>
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
        source={require("../assets/noConnection.json")}
      />
      <AppText text={hasInternet ? 'Internet connection is available.' : 'No internet connection.'} style={{color:Colors.black,letterSpacing:2,marginVertical:10}}/>
      <AppText text={"فشل الاتصال بنجيك. يرجى التحقق من اتصال الشبكة بجهازك."} style={{textAlign:'center',marginVertical:10}}/>
     <AppButton title="Retry" onPress={handleRetry} />
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

export default NoConnectionScreen;
