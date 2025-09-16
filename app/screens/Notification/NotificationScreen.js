import { View, Text, StatusBar, Dimensions, TouchableOpacity, RefreshControl, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ArrowBack from "../../component/ArrowBack";
import LoadingScreen from "../loading/LoadingScreen";
import { SafeAreaView } from "react-native";
import { Colors } from "../../constant/styles";
import { FlatList } from "react-native";
import AppText from "../../component/AppText";
import { ScrollView } from "react-native-virtualized-view";
import NotificationItem from "../../component/notifications/NotificationItem";
import AppButton from "../../component/AppButton";
import { useSelector } from "react-redux";
import { DeleteNotification, getUserById, getUserByPhoneNumber } from "../../../utils/user";
import NotificationsHeader from "../../component/notifications/NotificationHeader";
const { width, height } = Dimensions.get('screen')
export default function NotificationScreen() {
  const [notifications, setNotifications] = useState(null);
  const [refreching, setRefreching] = useState(false);
  const user = useSelector((state)=>state?.user?.userData)
  useEffect(() => {
    getUserNotifications();
  },[]);
  const  getUserNotifications = async () => {
    try {
      
      setRefreching(true)
      const userData = await getUserByPhoneNumber(user?.attributes?.phoneNumber)
      if(userData){
        
        setNotifications(userData?.attributes?.notifications.reverse());
      }
    } catch (error) {
      console.log('error refrech',error)
    }finally{
      setRefreching(false)
    }
    }
    const deleteNotification = async(item) => {
      try {
        
      setNotifications(notifications.filter((n) => n !== item));
      await AsyncStorage.setItem("notifications",JSON.stringify(notifications.filter((n) => n !== item)))
    } catch (error) {
      
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bodyBackColor }}>
      <StatusBar backgroundColor={Colors.primaryColor} />
<NotificationsHeader length={notifications?.length}
onRefresh={getUserNotifications}
/>
      
      <ScrollView style={{paddingHorizontal:20,}}
      
      refreshControl={<RefreshControl
      refreshing={refreching}
      showsVerticalScrollIndicator={false}
      onRefresh={()=>getUserNotifications()}
      />}>
        {
          notifications?.length > 0 ?
          <FlatList
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}

          data={notifications}
          style={{
            display: "flex",
            flexDirection:'column',
            width:Platform.OS === 'ios' ? width*  0.98 : width*  0.9,
            // alignContent: 'center',
            // gap: 10,
            marginBottom:10,
            flex:1,
        // paddingHorizontal:100,
            // backgroundColor:'red',
          }}
          renderItem={({ item,index }) => {
            const { body, text,date} = item 
            return <NotificationItem  
            text={text} 
            time={date}
            body={body}
            onDeleteNotfication={async()=>{
              try {
                
                DeleteNotification(user?.id,'provider',item?.id)
                setRefreching(true)
                getUserNotifications()
              } catch (error) {
                console.log('error delteing ',error)
              }finally{
                setRefreching(false)
              }
            }} />;
            
          }}
          // inverted={true} // This line inverts the order of items

          keyExtractor={(item, index) => item + index}
          />
        :<AppText text={"There is no notifications yet"} style={{marginTop:height*0.35}}/>}
      </ScrollView>
    </View>
  );
}
