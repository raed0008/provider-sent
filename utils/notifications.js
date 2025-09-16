import { View, Text } from 'react-native'
import React from 'react'
import { useState, useRef,useEffect } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AddNewNotification, AddNewNotificiation, updateProviderData, updateUserData } from './user';
import { useSelector } from "react-redux";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();  
    const userData = useSelector((state)=>state?.user?.userData)


    const setNotificationsTokenToStroage = async(token)=>{
        await AsyncStorage.setItem(
            "notificationsToken",
            JSON.stringify(token)
          );
    }
    useEffect(() => {
      registerForPushNotificationsAsync().then(token => {
        setExpoPushToken(token)
        if(!userData?.expoPushNotificationToken  || userData?.expoPushNotificationToken !== token){

          updateUserData(userData?.id,{"expoPushNotificationToken":token})
        }
          setNotificationsTokenToStroage(token)
        });
  
      notificationListener.current = Notifications?.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });
  
      responseListener.current = Notifications?.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
    //   sendPushNotification("ExponentPushToken[SnJOaPN023o2hr9sTHADnF]")
      return () => {
        Notifications?.removeNotificationSubscription(notificationListener.current);
        Notifications?.removeNotificationSubscription(responseListener.current);
      };
    }, []);
    async function sendPushNotification(expoPushToken,title,body,type,userId,store=true) {
        const message = {
          to: expoPushToken,
          sound: "default",
          title: title,
          body: body,
          data: { someData: 'goes here' },
        };
      
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      await   AddNewNotification(userId,type,{
        text: title,
        body: body,
        data:'',
        date:new Date(),
      },store)
      }
      async function registerForPushNotificationsAsync() {
        let token;
      
        if (Platform.OS === 'android') {
          Notifications?.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
          });
        }
      
        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
          }
          token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId,
          });
        } else {
          console.log('Must use physical device for Push Notifications');
        }
      
        return token.data;
      }

      async function  getExpoPushTokenStorage  () {
        try {
          const token = await AsyncStorage.getItem("notificationsToken");
           if(token) return token 
            return null
           
        } catch (error) {
          console.log("Error retrieving notification token from storage:", error);
        }
      };
      
  return (
  { 
     token:expoPushToken,
    sendPushNotification,
    getExpoPushTokenStorage
}
  )
}