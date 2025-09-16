import React, { useEffect, useState } from 'react';
import { View, Text, Button, Dimensions } from 'react-native';
import { Tabby, TabbyPaymentWebView } from 'tabby-react-native-sdk';
import { initiateTabbyPayment, myTestPayment } from './paymentData';
import { ActivityIndicator } from 'react-native-paper';
import { HandleUserBalanceAfterOperation ,HandleProviderProfitAfterSuccessPayment, getTabbyPaymentUrl} from './Tabbyhelpers';
import { useDispatch, useSelector } from 'react-redux';
import { GetOrderData } from '../../../../utils/orders';
import ArrowBack from '../../../component/ArrowBack';
import useNotifications from '../../../../utils/notifications';


const { height , width} = Dimensions.get('screen')
const CheckoutScreen = ({ navigation,route }) => {

    const {   url,
      orderId,
      sessionId,
      handlePayOrderFun,decreadedAmountFromWallet} = route?.params
      const dispatch = useDispatch()
      const user = useSelector((state)=>state?.user?.userData)
      const [webUrl,setWebUrl] = useState(url)
      const [currentOrderData,setCurrentOrderData] = useState(null)
      const [paymentType,setPaymentType] = useState(null)
      const {sendPushNotification} = useNotifications()
      const getOrderDetails = async()=>{
        try {
          const orderIdMatch = orderId.match(/ORDER(\d+)/);

          if (orderIdMatch && orderIdMatch[1]) {
              const OrderCurrentID = orderIdMatch[1];
              console.log("order id is yahhh", OrderCurrentID)
              setPaymentType('order')
              const res = await GetOrderData(OrderCurrentID)
              if(res){
                // console.log('the order data afet fetcing ',res)
                setCurrentOrderData(res)
              }
          }else {
            setPaymentType('wallet')
          }
        } catch (error) {
          
        }
      }
    useEffect(() => {
      getOrderDetails()
    }, [])
    
 
      const handleSuccesFunction = async()=>{
        try {
          if(paymentType === 'order'){

            HandleUserBalanceAfterOperation(orderId,decreadedAmountFromWallet,user,dispatch)
            HandleProviderProfitAfterSuccessPayment(currentOrderData,sendPushNotification)
            handlePayOrderFun()
            
          }else {
            handlePayOrderFun()
          }
        } catch (error) {
          console.log('error handle tabby payment succes',error)
        }
      }
  
  return (
    <View style={{ flex: 1 , height :height }}>
      {webUrl ? (
        <TabbyPaymentWebView
          url={webUrl}
          onBack={() => console.log('the user back')}
          onResult={(msg) => {
            switch (msg) {
              case 'authorized':
                handleSuccesFunction()
                break;
                case 'rejected':
                  // navigation.navigate('FailureScreen');
                  navigation.goBack()
                  
                  break;
                  case 'close':
                navigation.goBack()

                break;
              case 'expired':
                navigation.goBack()

                break;
              default:
                break;
            }
          }}
        />
      ) : (
        <View>
<ArrowBack back={false}/>
        <View style={{display:'flex',alignItems:'center',justifyContent: 'center',height:height*0.8}}>

      <ActivityIndicator size={55}/>
      </View>
      </View>
      )}
    </View>
  );
};

export default CheckoutScreen;
