import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback, memo } from 'react';
import { View } from 'react-native';
import UserLocation from './Home/UserLocation';
import AgreementProminentDisclosure from './ProminentDisclosure';

const LocationAgreementComponent = () => {
  const [agreementStatus, setAgreementStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('location AgreementComponent');

  const getStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await AsyncStorage.getItem('agreeLocationProminentDisclosure');
      console.log('Retrieved agreement status:', status);
      
      if (status === "true") {
        setAgreementStatus(true);
      } else {
        setAgreementStatus(false);
      }
    } catch (error) {
      console.error('Error getting agreement status:', error);
      setAgreementStatus(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getStatus();
  }, [getStatus]);

  // دالة لتحديث حالة الموافقة
  const handleAgreementStatusUpdate = useCallback(async (status) => {
    try {
      setAgreementStatus(status);
      await AsyncStorage.setItem('agreeLocationProminentDisclosure', status.toString());
      console.log('Agreement status updated:', status);
    } catch (error) {
      console.error('Error updating agreement status:', error);
    }
  }, []);

  if (isLoading) {
    return <View />; // أو يمكنك إضافة loading indicator هنا
  }

  return (
    <View>
      {agreementStatus ? (
        <UserLocation />
      ) : (
        <AgreementProminentDisclosure 
          setAgreementStatus={handleAgreementStatusUpdate}
        />
      )}
    </View>
  );
};

export default memo(LocationAgreementComponent);