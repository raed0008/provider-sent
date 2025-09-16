import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n from 'i18next';
import * as Updates from 'expo-updates';

const useLanguage = () => {
  const [direction, setDirection] = useState('rtl');
  const [language, setLanguage] = useState('ar'); // Default language
  const [loading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    const initializeLanguage = async () => {
      if (initializedRef.current) return;
      try {
        console.log('render the language in useLanguage:', language);
        const storedLanguage = await AsyncStorage.getItem('language');
        const initialLanguage = storedLanguage || 'ar';
        setLanguage(initialLanguage);
        const isRTL = initialLanguage === 'ar';
        I18nManager.forceRTL(isRTL);
        I18nManager.allowRTL(isRTL);
        setDirection(isRTL ? 'rtl' : 'ltr');
        if (!storedLanguage) {
          await AsyncStorage.setItem('language', 'ar');
        }
      } catch (error) {
        console.error('Error fetching language:', error);
      } finally {
        setIsLoading(false);
        initializedRef.current = true;
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = useCallback(async (newLanguage) => {
    try {
      await i18n.changeLanguage(newLanguage); // Assuming i18n is configured
      await AsyncStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
      const isRTL = newLanguage === 'ar';
      I18nManager.forceRTL(isRTL);
      I18nManager.allowRTL(isRTL);
      setDirection(isRTL ? 'rtl' : 'ltr');
      // Optional: Reload app for complete UI update (consider user experience)
      await Updates.reloadAsync(); // If using Expo updates
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  const memoizedValue = useMemo(() => ({
    direction,
    language,
    changeLanguage,
    loading,
  }), [direction, language, loading, changeLanguage]);

  return memoizedValue;
}

export default useLanguage;
