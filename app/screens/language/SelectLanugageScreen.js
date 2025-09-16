import React, { useState,useEffect } from "react";
import { Text, View, StyleSheet, StatusBar, ScrollView, Image, Dimensions, TouchableOpacity } from "react-native";
import { Colors, Fonts, Sizes } from "../../constant/styles";
import { MaterialIcons } from '@expo/vector-icons';
import { Dialog } from "react-native-paper";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ORDER_SUCCESS_SCREEN } from "../../navigation/routes";
import { useTranslation } from "react-i18next";
import AppText from "../../component/AppText";
import { PayOrderForReserve } from "../../../utils/orders";
import LoadingScreen from "../../screens/loading/LoadingScreen";
import tw from 'twrnc'
import { useLanguageContext } from "../../context/LanguageContext";
const { width } = Dimensions.get('screen');

const SelectLangaugeScreen = ({ navigation,route }) => {

    const {changeLanguage,language}=useLanguageContext()
    const [loading,setIsLoading]=useState(false)
    const [state, setState] = useState({
        currentPaymentMethodIndex: language ==='ar',
        showSuccessDialog: false,
    })
    const updateState = (data) => setState((state) => ({ ...state, ...data }))
    const {
        currentPaymentMethodIndex,
        showSuccessDialog,
    } = state;
    useEffect(() => {
     if(language === 'ar')  updateState({ currentPaymentMethodIndex: 1 })
     else   if(language === 'en')  updateState({ currentPaymentMethodIndex: 2 })
    }, [language])
    
    if(loading)return<LoadingScreen/>
    return (
        <View style={{ flex: 1, backgroundColor: Colors.bodyBackColor }}>
            <StatusBar backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: Sizes.fixPadding * 8.0 }}
                >
                 
                
                    <PaymentMethod
                        icon={require('../../assets/images/payment_icon/card.png')}
                        paymentType='Arabic'
                        index={1}

                    />
                
                    <PaymentMethod
                        icon={require('../../assets/images/payment_icon/card.png')}
                        paymentType='English'
                        index={2}

                    />
                    
                </ScrollView>
                {/* {payButton()} */}
            </View>
            {successDialog()}
        </View>
    )

    function successDialog() {
        return (
            <Dialog
                visible={showSuccessDialog}
                style={styles.dialogWrapStyle}
                
            >
                <View style={{ backgroundColor: Colors.whiteColor, alignItems: 'center' }}>
                    <View style={styles.successIconWrapStyle}>
                        <MaterialIcons name="done" size={40} color={Colors.primaryColor} />
                    </View>
                    <Text style={{ ...Fonts.grayColor18Medium, marginTop: Sizes.fixPadding + 10.0 }}>
                       تم حجز الطلب بنجاح!
                    </Text>
                </View>
            </Dialog>
        )
    }

 

    function PaymentMethod({ icon, paymentType, index }) {
        return (
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={async() => {
                  
                  await  changeLanguage(language === 'ar' ? 'en':'ar')
                  
                    
                }}
                style={{
                    borderColor: currentPaymentMethodIndex == index ? Colors.primaryColor : '#E0E0E0',
                    ...styles.paymentMethodWrapStyle
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText numberOfLines={1} style={{
                         ...Fonts.primaryColor18Medium,
                         marginLeft: Sizes.fixPadding,
                         width: width / 2.2,
                     }}
                        text={paymentType} />
                </View>
                <View style={{
                    borderColor: currentPaymentMethodIndex == index ? Colors.primaryColor : '#E0E0E0',
                    ...styles.radioButtonStyle
                }}>
                    {
                        currentPaymentMethodIndex == index ?
                            <View style={{
                                width: 12.0,
                                height: 12.0,
                                borderRadius: 6.0,
                                backgroundColor: Colors.primaryColor
                            }}>
                            </View> : null
                    }
                </View>
            </TouchableOpacity>
        )
    }

    function header() {
        const {t}=useTranslation()
        return (
            <View style={[styles.headerWrapStyle,tw`${language === 'ar' ? 'flex-row':'flex-row-reverse'}`]}>
                <Text style={{ ...Fonts.whiteColor19Medium, marginLeft: Sizes.fixPadding + 5.0 }}>
             {   t('Choose Language')}
                </Text>
                <MaterialIcons
            name={'arrow-back'}
            size={27}
            color={Colors.whiteColor}
            style={{
                marginHorizontal: Sizes.fixPadding * 2.0,
                marginVertical: Sizes.fixPadding * 2.0,
            }}
            onPress={() => navigation.pop()}
        />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerWrapStyle: {
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent:"space-between",
        // height: 56.0,
        paddingHorizontal: Sizes.fixPadding * 2.0,
        marginBottom: Sizes.fixPadding,
    },
    paymentMethodWrapStyle: {
        backgroundColor: Colors.whiteColor,
        borderRadius: Sizes.fixPadding,
        borderWidth: 1.0,
        marginHorizontal: Sizes.fixPadding * 2.0,
        paddingHorizontal: Sizes.fixPadding * 2.0,
        paddingVertical: Sizes.fixPadding * 2.0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: Sizes.fixPadding,
    },
    radioButtonStyle: {
        width: 20.0,
        height: 20.0,
        borderRadius: 10.0,
        borderWidth: 1.0,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    payButtonOuterWrapStyle: {
        position: 'absolute',
        bottom: 0.0,
        left: 0.0,
        right: 0.0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.whiteColor,
        borderTopColor: '#ECECEC',
        borderTopWidth: 1.0,
        paddingVertical: Sizes.fixPadding,
        paddingHorizontal: Sizes.fixPadding * 2.0
    },
    payButtonWrapStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        borderRadius: Sizes.fixPadding - 5.0,
        paddingVertical: Sizes.fixPadding,
        width: '100%'
    },
    dialogWrapStyle: {
        borderRadius: Sizes.fixPadding,
        width: width - 100,
        backgroundColor: Colors.whiteColor,
        paddingHorizontal: Sizes.fixPadding * 2.0,
        paddingVertical: Sizes.fixPadding * 3.,
        alignSelf: 'center',
    },
    successIconWrapStyle: {
        backgroundColor: Colors.whiteColor,
        borderColor: Colors.primaryColor,
        borderWidth: 1.0,
        width: 70.0,
        height: 70.0,
        borderRadius: 35.0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payableAmountWrapStyle: {
        backgroundColor: '#F8F3EC',
        paddingVertical: Sizes.fixPadding + 5.0,
        paddingHorizontal: Sizes.fixPadding * 2.0,
        marginBottom: Sizes.fixPadding
    }
})

export default SelectLangaugeScreen;