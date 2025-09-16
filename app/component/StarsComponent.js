import { Rating, AirbnbRating } from "react-native-ratings";
import Modal from "react-native-modal";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import * as Linking from 'expo-linking'
import { MaterialCommunityIcons} from '@expo/vector-icons'
import React, { useRef, useState } from "react";
import AppText from "./AppText";
import { useDispatch, useSelector} from 'react-redux'

import AppFormField from "./Form/FormField";
import {RFPercentage} from 'react-native-responsive-fontsize'
import SubmitButton from "./Form/FormSubmitButton";
import useOrders, { AddOrderReview, UpdateOrder, useSingleOrder } from "../../utils/orders";
import { Alert } from "react-native";
import { HOME } from "../navigation/routes";
const { width } = Dimensions.get("screen");
import { CommonActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { Colors, mainFont } from "../constant/styles";
import ArrowBack from "./ArrowBack";
import { Animated, Easing } from "react-native";

import { getUserByPhoneNumber, updateProviderData, updateUserData } from "../../utils/user";
import useNotifications from "../../utils/notifications";
import { useTranslation } from "react-i18next";
import { useHover } from "react-native-web-hooks";
import { Hoverable } from "react-native-web-hover";
import AppButton from "./AppButton";
import LoadingModal from "./Loading";
import LoadingScreen from "../screens/loading/LoadingScreen";
import { setUserData, userRegisterSuccess } from "../store/features/userSlice";
export default function StarsComponent({ route }) {
  const [rating, setRating] = useState(0);
  const navigation = useNavigation();
  const userData = useSelector((state)=>state?.user?.userData)
  const dispatch = useDispatch()
  const [focus, setFocus] = useState(null);
  const [description,setDescription]=useState(null)
  const [loading,setIsLoading] = useState(false)
  const { sendPushNotification } = useNotifications();
  const { t } = useTranslation();
  const {orderID} = route?.params
  // const {data:selectedOrder,isLoading} = useSingleOrder(orderID)
  const RatingEmojs = [
    {
      emoji: "emoticon-outline",
      explain: "Excellent",
      rate: 5,
    },
    {
      emoji: "emoticon-happy-outline",
      explain: "Good",
      rate: 4,
    },
    {
      emoji: "emoticon-confused-outline",
      explain: "Average",
      rate: 3,
    },
    {
      emoji: "emoticon-frown-outline",
      explain: "Bad",
      rate: 2,
    },
    {
      emoji: "emoticon-angry-outline",
      explain: "Very Bad",
      rate: 1,
    },
  ];
  const handleFormSubmit = async (values) => {
    try {
      setIsLoading(true)
      const { orderID, item:selectedOrder } = route?.params;
      const SelectedRate = RatingEmojs.filter((item)=>item?.explain === focus)[0]
      const res = await UpdateOrder(orderID, {
        providerOrderRating:SelectedRate?.rate?.toString(),
        providerOrderReview:description,
      });
     

      const userNotificationToken =
        selectedOrder?.attributes?.user?.data?.attributes
          ?.expoPushNotificationToken;

      const OrderProvider = selectedOrder?.attributes?.provider?.data?.id;
      const OrderUserId = selectedOrder?.attributes?.user?.data?.id;

      if (res) {
        navigation.goBack();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: t(HOME) }],
          })
        );
        if (userData?.attributes?.phoneNumber) {

          const gottenuser = await getUserByPhoneNumber(userData?.attributes?.phoneNumber);
          if (gottenuser) {
            dispatch(setUserData(gottenuser));
            dispatch(userRegisterSuccess(userData));
          }}
          let userId =   selectedOrder?.attributes?.user?.data?.id
        sendPushNotification(
          userNotificationToken,
          `تم إنهاء الطلب بواسطة ${selectedOrder?.attributes?.provider?.data?.attributes?.name}`,
          '', 'user',userId,true
          );
          Alert.alert(
            t("Done successfully"),
         t('Would you like to rate us on Store?'),
            [
              {
                text:t("Rate now"),
                onPress: async() => {
                  try{

                    if(Platform.OS === 'android'){
                      
                      Linking.openURL(`https://play.google.com/store/apps/details?id=com.njik.nijkProvider`)
                    }else if(Platform.OS === 'ios'){
                      Linking.openURL(`https://apps.apple.com/us/app/%D9%81%D9%86%D9%8A-%D9%86%D8%AC%D9%8A%D9%83/id6498982246`)
                      
                    }
                  }catch(err){
                    console.log('error opening the app ',err)
                  }
                },
              },
              {
                text: t('Not Now'),
                onPress: () => console.log("Not now pressed"),
              },
            ],
            { cancelable: false } // Prevent closing by tapping outside
          );
           
                } else {
                  Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);
                }
    } catch (error) {
      console.log(error, "error paying the order");
    }finally {
      setIsLoading(false)

    }
  };
  if( loading){
    return <LoadingScreen/>
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ArrowBack subPage={true} />
      <View style={{ flex: 1 }}>
        <AppText text={"Write your customer review"} style={styles.text} />

        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 10,
            gap:5
          }}
        >
          <AppText
            text={
              route?.params?.item?.attributes?.provider?.data?.attributes?.name
            }
            style={styles.text}
          />
          <View style={styles.emojiContainer}>
            {RatingEmojs.map((item,index) => {
              return (
                <Hoverable
                key={index}
                  onTouchStart={() => setFocus(item?.explain)}
                  onHoverOut={() => console.log(item?.explain)}
                  style={[
                    focus === item.explain
                      ? styles.Selectedemoji
                      : styles.emoji,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item?.emoji}
                    style={[
                      focus === item.explain
                        ? styles.SelectEmojiImage
                        : styles.emojiImage,
                    ]}
                    color={"black"}
                  />
                  <AppText
                    text={item?.explain}
                    style={
                      focus === item.explain
                        ? styles.SelectedEmojiExplain
                        : styles.emojiExplain
                    }
                  />
                </Hoverable>
              );
            })}
          </View>
        </View>
        <View style={styles.inputContainer}>
        <TextInput
      showSoftInputOnFocus
      selectTextOnFocus
        selectionColor={Colors.primaryColor}
        // textAlign={ language === 'ar' ? "right" : 'left'
        textAlignVertical="top"
        placeholder={t('Write your customer review')}
        placeholderTextColor={Colors.grayColor}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={true}
        numberOfLines={4}
        onChangeText={(t)=>setDescription(t)}
        
        
        />
        </View>
      <AppButton onPress={handleFormSubmit} title={"Confirm"} disabled={!focus} style={styles.buttonSubmit}/>

      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteColor,
  },
  text: {
    color: "black",
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  review: {
    color: "black",
    paddingHorizontal: 20,
    marginVertical: 5,
    fontSize:RFPercentage(2)
  },
  buttonSubmit: {
    width: width * 0.4,
    marginVertical: 10,
    alignSelf: "center",
  },
  Image: {
    height: 100,
    width: 100,
    alignSelf: "center",
    // marginBottom: 10,
  },
  emojiContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  emoji: {
    display: "flex",
    flexDirection: "column",
    // justifyContent:'center'
    // gap:10
  },
  emojiImage: {
    fontSize: 35,
    color: Colors.grayColor,
  },
  emojiExplain: {
    fontSize: RFPercentage(1.8),
    textAlign:'center'
  },
  Selectedemoji: {
    display: "flex",
    color:Colors.primaryColor,
    flexDirection: "column",
    transform: [{ scale: 1.2 ,}],
    
    // gap:10
  },
  SelectEmojiImage: {
    fontSize: 55,
    color:Colors.primaryColor,
    height: "auto",
  },
  SelectedEmojiExplain: {
    fontSize: 15,
    color:Colors.blackColor,

  },
  input :{
    borderWidth: 1,
    width:width*0.9,
    marginTop:15,
    padding:10,
    borderRadius: 10,
    fontFamily: mainFont.light,
    borderColor: Colors.blackColor,
    writingDirection: "rtl",
    fontSize: 15,
  },
  inputContainer:{
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  }
});
