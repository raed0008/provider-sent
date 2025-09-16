import React, { useEffect, useState, memo, useCallback } from 'react';
import { View, Dimensions, StyleSheet, Alert, Platform } from 'react-native';
import Dialog from 'react-native-dialog';
import { Colors, Sizes } from '../constant/styles';
import { RFPercentage } from 'react-native-responsive-fontsize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import AppText from './AppText';
import AppButton from './AppButton';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('screen');

 const AgreamentProminentDisclosureLocation = ({ setAgreamentStatus }) => {
  const [agreeProminentDisclosure, setAgreeProminentDisclosure] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const requestLocationPermission = useCallback(async () => {
    try {
      setIsRequestingPermission(true);
      
      // التحقق من حالة الإذن الحالية
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        // إذا كان foreground موجود، تحقق من background
        const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
        
        if (backgroundStatus === 'granted') {
          return { success: true, type: 'already_granted' };
        }
      }
      
      // طلب foreground permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        // بعد منح foreground، اطلب background
        try {
          const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
          
          if (backgroundStatus === 'granted') {
            return { success: true, type: 'full_access' };
          } else {
            return { success: true, type: 'foreground_only' };
          }
        } catch (bgError) {
          console.log('Background permission error:', bgError);
          return { success: true, type: 'foreground_only' };
        }
      } else if (foregroundStatus === 'denied') {
        return { success: false, type: 'foreground_denied' };
      } else {
        return { success: false, type: 'foreground_cancelled' };
      }
      
    } catch (error) {
      console.error('خطأ في طلب إذن الموقع:', error);
      return { success: false, type: 'error', error };
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  const handleAgree = useCallback(async () => {
    if (isRequestingPermission) return;
    
    try {
      const result = await requestLocationPermission();
      
      if (result.success) {
        // تم منح الإذن بنجاح
        await AsyncStorage.setItem('agreeLocationProminentDisclosure', 'true');
        setAgreeProminentDisclosure(true);
        
        // تحديث الحالة بشكل آمن
        if (typeof setAgreamentStatus === 'function') {
          setAgreamentStatus(true);
        }
        
    
        
        
      } else {
        // فشل في الحصول على الإذن
        let title = "إذن الموقع";
        let message = "";
        let buttons = [];
        
        switch (result.type) {
          case 'foreground_denied':
            title = "إذن الموقع مطلوب";
            message = "هذا التطبيق يحتاج إلى إذن الوصول للموقع لتقديم الخدمة بشكل صحيح.";
            buttons = [
              { text: "إلغاء", style: "cancel" },
              { text: "إعادة المحاولة", onPress: handleAgree }
            ];
            break;
            
          case 'foreground_cancelled':
            message = "تحتاج للموافقة على إذن الموقع لاستخدام التطبيق.";
            buttons = [
              { text: "إعادة المحاولة", onPress: handleAgree }
            ];
            break;
            
          default:
            message = "حدث خطأ أثناء طلب إذن الموقع.";
            buttons = [
              { text: "إعادة المحاولة", onPress: handleAgree }
            ];
        }
        
        Alert.alert(title, message, buttons);
      }
    } catch (error) {
      console.log('خطأ في معالجة الموافقة:', error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء طلب الإذن. يرجى المحاولة مرة أخرى.",
        [{ text: "حسناً" }]
      );
    }
  }, [isRequestingPermission, requestLocationPermission, setAgreamentStatus]);

  const getStatus = useCallback(async () => {
    try {
      const status = await AsyncStorage.getItem('agreeLocationProminentDisclosure');
      
      if (status === 'true') {
        // تحقق من أن الإذن ما زال موجود
        const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
        
        if (foregroundStatus === 'granted') {
          setAgreeProminentDisclosure(true);
          if (typeof setAgreamentStatus === 'function') {
            setAgreamentStatus(true);
          }
        } else {
          // إذا تم إلغاء الإذن، أعد تعيين الحالة
          await AsyncStorage.removeItem('agreeLocationProminentDisclosure');
          setAgreeProminentDisclosure(false);
          if (typeof setAgreamentStatus === 'function') {
            setAgreamentStatus(false);
          }
        }
      } else {
        setAgreeProminentDisclosure(false);
        if (typeof setAgreamentStatus === 'function') {
          setAgreamentStatus(false);
        }
      }
    } catch (error) {
      console.log('خطأ في قراءة حالة الإذن:', error);
      setAgreeProminentDisclosure(false);
      if (typeof setAgreamentStatus === 'function') {
        setAgreamentStatus(false);
      }
    }
  }, [setAgreamentStatus]);

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  if (agreeProminentDisclosure) return null;

  return (
    <Dialog.Container
      blurStyle={{ backgroundColor: Colors.whiteColor }}
      visible={!agreeProminentDisclosure}
      contentStyle={styles.dialogContainerStyle}
    >
      <LottieView
        autoPlay
        style={{
          width: width * 0.2,
          height: height * 0.2,
        }}
        source={require('../assets/location.json')}
      />
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <AppText
          text={
            Platform.OS === 'ios' 
              ? 'In order for us to receive your requests and reach the service provider closest to you, please set the location permission to (always in use)'
              : 'In order for us to receive your requests and reach the service provider closest to you, please set the location permission to (always in use)'
          }
          centered={true}
          style={styles.amountText}
        />
      </View>
      <View style={styles.buttonsContainer}>
        <AppButton 
          title={isRequestingPermission ? 'جاري الطلب...' : 'Confirm'} 
          onPress={handleAgree} 
          style={{ 
            paddingHorizontal: 30, 
            marginVertical: 50,
            opacity: isRequestingPermission ? 0.7 : 1
          }}
          disabled={isRequestingPermission}
        />
      </View>
    </Dialog.Container>
  );
};
export default memo(AgreamentProminentDisclosureLocation);

const styles = StyleSheet.create({
  dialogContainerStyle: {
    borderRadius: Sizes.fixPadding,
    width: width * 0.9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    paddingHorizontal: 10,
    color: Colors.blackColor,
    fontSize: RFPercentage(1.99),
    textAlign: 'center',
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
});