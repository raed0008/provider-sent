// Import necessary modules
import React, { useRef, useState,useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { CECKOUT_WEBVIEW_SCREEN, SUCESS_PAYMENT_SCREEN } from '../../navigation/routes';
import { Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { checkOrderStatus } from '../../utils/Payment/Initate';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { Dialog as PaperDialog } from 'react-native-paper';
import { Colors, Sizes,Fonts } from '../../constant/styles';
import AppText from '../../component/AppText';
import { useSelector } from 'react-redux';
import { AddNewPaymentProcess } from '../../../utils/payment_process';
import ArrowBack from '../../component/ArrowBack';

const { width , height } = Dimensions.get('screen')
export default function PaymentWebview({ route, navigation }) {
    const url = route?.params?.url
    const orderId = route?.params?.orderId
    const handlePayOrder = route?.params?.handlePayOrderFun
    const [lastMessage, setLastMessage] = useState(null);
    const webViewRef = useRef(null)
    const user = useSelector((state) => state?.user?.userData);

    const [currentOperationStatus,SetCurrentOperationStatus]=useState(null)
    const [orderStatusChecked, setOrderStatusChecked] = useState(false);
const [showDialog,setShowDialog]=useState(false)
    const handleWebViewError = (syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView error: ', nativeEvent);
        // Handle the error, e.g., show an alert or navigate to an error screen
        Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);
    };
    useEffect(() => {
        if (currentOperationStatus !== null) {
            if(currentOperationStatus === "decline"){
            //   Alert.alert("the operation was declined man bad news")
            // reloadWebView()
            console.log("declined operatoin1")
            AddPaymentSuccessfull()
              Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'عملية مرفوضة',
                button: 'إغلاق',
                onHide: () => navigation.navigate("App")

            })
            }
            else if(currentOperationStatus === "settled"){
            //   Alert.alert("the operation was declined man bad news")
            AddPaymentSuccessfull()
              Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'عملية ناجحة 🎉🎉',
                textBody:"تمت عملية الدفع بنجاح",
                button: 'إغلاق',
                onHide: () => handlePayOrder()
               

            })
            }
            console.log("you have to return status of the order to the user with status of 2:", currentOperationStatus);
        }
    }, [currentOperationStatus]); 

    const debugging = `
    const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({
      'type': 'Console',
      'data': {
        'type': type,
        'log': log
      }
    }));
    window.ReactNativeWebView.postMessage(JSON.stringify({
        'type': 'DATA',
        'data': {
            // Extract data from the page here
        }
    }));
  
    console = {
        log: (...args) => consoleLog('log', args),
        debug: (...args) => consoleLog('debug', args),
        info: (...args) => consoleLog('info', args),
        warn: (...args) => consoleLog('warn', args),
        error: (...args) => consoleLog('error', args),
     };
  `;
  const AddPaymentSuccessfull = async(data)=>{
      try{
        const response = await checkOrderStatus(orderId)
        console.log("Data passed to AddNewPaymentProcess:", {
            ...response?.responseBody,
            userId:`provider_${user?.id}`
        });
        const res = await AddNewPaymentProcess(
         response?.responseBody,
     `provider_${user?.id}`

                 );
        console.log("Result of AddNewPaymentProcess:", res);
        if(res){

            console.log("the ress res is ",{
                ...response?.responseBody,
                userId:user?.id?.toString()
            })
            return res
        }
        return null
    }catch(err){

    }
  }
    const reloadWebView = () => {
        if (webViewRef.current) {
            webViewRef.current.reload();
        }
    };
    const handleWebViewMessage = (payload) => {
        let dataPayload;
        try {
            dataPayload = JSON.parse(payload.nativeEvent.data);
        } catch (e) {
            console.error("error ", e)
        }

        if (dataPayload && dataPayload.type === 'Console') {
            const Data = (dataPayload?.data?.log[1]?.data?.responseBody)
            if (typeof (Data) === "string") {
                if (Data === "Order Status not allowed to update") {

                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'عملية مرفوضة',
                        button: 'إغلاق',
                        onHide: () => navigation.navigate("App")

                    })
                }
                try {
                    const jsonObject = JSON.parse(Data);
                    console.log("Data response ",Data)
                    const ErrorMessage = jsonObject?.errors[0]?.error_message
                    if (ErrorMessage) {
                        reloadWebView()
                        console.log("declined operatoin2")

                        Dialog.show({
                            type: ALERT_TYPE.DANGER,
                            title: 'عملية مرفوضة',
                            textBody: 'بيانات البطافة المدخلة غير صحيحة',
                            button: 'إغلاق',

                        })
                    }

                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    // Handle the error, e.g., show an error message to the user
                }
            }
        }
    };

    const CheckOrderStatusAndDisplayMessage = async() => {
        if (orderStatusChecked) return;
try {
    

       const data  = await  checkOrderStatus(orderId)
            if(data)  {
                    setOrderStatusChecked(true); // Mark the status as checked
                    if(data?.responseBody?.status){
                        SetCurrentOperationStatus(data?.responseBody?.status)
                        return (data?.responseBody?.status)
                    }
                
            }
            
        } catch (error) {
            console.log('Error:', error)
        }
    }



    return (
        <AlertNotificationRoot>
            <View style={styles.container} >
                 <ArrowBack style={{backgroundColor:'white',padding:5}} />
                
                <WebView
    showsVerticalScrollIndicator={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    ref={webViewRef} // Assign the reference to the WebView

                    startInLoadingState={true}
                    onNavigationStateChange={async (navState) => {
                        try {
                            console.log("the current url of the page is22:", navState.url);

                            if (navState?.url.includes("https://pay.expresspay.sa/interaction/")) {

                                CheckOrderStatusAndDisplayMessage()
                                console.log("the user has been redirected to the redirect page")
                            } else if (navState?.url.includes("https://njik.sa/")) {
                                setOrderStatusChecked(false)
                                
                                const status = CheckOrderStatusAndDisplayMessage()
                                console.log("you have to return status of the order to the user with status of 1:",status)
                                console.log("you have to return status of the order to the user with status of2 :",currentOperationStatus)
                                // navigation.goBack()
                            }else   if (navState.url !== url) {
                                console.log("User navigated away from the WebView",url);
                                // You can perform any additional actions here, such as setting state or navigating to another screen
                            }


                            // console.log("the navigation state ",navState)
                        } catch (error) {
                            console.log("error when payment ", error)
                        }
                    }
                    }

                    onError={handleWebViewError} // Add this line

                    source={{ uri: url }}

                    originWhitelist={['*']}

                    injectedJavaScript={debugging}
                    onMessage={handleWebViewMessage}


                />

            </View>
            <AlertDialog
            setShowSuccessDialog={setShowDialog}
            showSuccessDialog={showDialog}
            />
        </AlertNotificationRoot>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
        
    },
    dialogWrapStyle: {
        borderRadius: Sizes.fixPadding,
        width: width - 100,
        backgroundColor: Colors.whiteColor,
        paddingHorizontal: Sizes.fixPadding * 2.0,
        paddingVertical: Sizes.fixPadding * 3.,
        alignSelf: 'center',
    },
});

function AlertDialog({showSuccessDialog,setShowSuccessDialog}) {
    return (
        <PaperDialog
            visible={showSuccessDialog}
            style={styles.dialogWrapStyle}
            onDismiss={() => setShowSuccessDialog( false )}
        >
            <View style={{ backgroundColor: Colors.whiteColor, alignItems: 'center' }}>
                <View style={styles.successIconWrapStyle}>
                    <MaterialIcons name="error" size={40} color={Colors.primaryColor} />
                </View>
                <AppText  style={{ ...Fonts.blackColor20Medium, marginTop: Sizes.fixPadding + 10.0 }} text={" عملية مرفوضة"}/>
                 
            </View>
        </PaperDialog>
    )
}