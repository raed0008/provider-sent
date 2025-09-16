import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n from 'i18next';
import * as Updates from 'expo-updates';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [direction, setDirection] = useState(I18nManager.isRTL ? 'rtl' : 'ltr');
  const [language, setLanguage] = useState('ar'); // Default language
  const [loading, setLoading] = useState(true);
  
  const initializeLanguage = useCallback(async (lang) => {
    try {
      const storedLanguage = await AsyncStorage.getItem('language');
      const initialLanguage = storedLanguage || lang || 'ar';
      
      setLanguage(initialLanguage);
      
      const isRTL = initialLanguage === 'ar';
      const shouldChangeDirection = I18nManager.isRTL !== isRTL;
      
      setDirection(isRTL ? 'rtl' : 'ltr');
      
      if (shouldChangeDirection) {
        I18nManager.forceRTL(isRTL);
        I18nManager.allowRTL(isRTL);
        
        if (Updates.isEnabled) {
          await Updates.reloadAsync();
        } else {
          // Fallback for development mode
          console.warn('Updates not enabled - restart manually for direction change');
        }
      }
    } catch (error) {
      console.log('Error fetching language:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  const changeLanguage = useCallback(async (newLanguage) => {
    try {
      const currentDirection = I18nManager.isRTL;
      const newIsRTL = newLanguage === 'ar';
      const shouldRestart = currentDirection !== newIsRTL;
      
      // Update i18n and storage first
      await i18n.changeLanguage(newLanguage);
      await AsyncStorage.setItem('language', newLanguage);
      
      setLanguage(newLanguage);
      setDirection(newIsRTL ? 'rtl' : 'ltr');
      
      // Only restart if direction actually changes
      if (shouldRestart) {
        I18nManager.forceRTL(newIsRTL);
        I18nManager.allowRTL(newIsRTL);
        
        // Use expo-updates for restart
        if (Updates.isEnabled) {
          await Updates.reloadAsync();
        } else {
          // Fallback for development mode
          console.warn('Updates not enabled - restart manually for direction change');
        }
      }
    } catch (error) {
      console.log('Error changing language:', error);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ direction, language, changeLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => useContext(LanguageContext);