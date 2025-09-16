import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useSelector } from 'react-redux';
// import { updateUserData } from '../../utils/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserData } from '../../utils/user';

const UserStatusContext = createContext();

export const UserStatusProvider = ({ children }) => {
  const user = useSelector((state) => state?.user?.userData);
  const [isOnline, setIsOnline] = useState(false);

  const updateUserStatus = useCallback(async (status) => {
    if (user?.id) {
      try {
        // console.log('Updating status for user:', user.id);
        const response = await updateUserData(user.id, { online: status });
        if (response) {
          console.log('Status update response:', response);
        }
      } catch (error) {
        console.log('Error updating status:', error);
      }
    }
  }, [user?.id]);

  const handleAppStateChange = useCallback((nextAppState) => {
    if (user?.id) {
      if (nextAppState === 'active') {
        setIsOnline(true);
        updateUserStatus(true);
        console.log('change the user online experience in provider app to online')
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('change the user online experience in provider app to offline')
        setIsOnline(false);
        updateUserStatus(false);
      }
    }
  }, [updateUserStatus, user?.id]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set the initial status to 'online' if the user is found
    if (user?.id) {
      setIsOnline(true);
      updateUserStatus(true);
    }

    // Cleanup function
    return () => {
      subscription.remove();
      if (user?.id) {
        setIsOnline(false);
        updateUserStatus(false);
      }
    };
  }, [handleAppStateChange, user?.id]);

  return (
    <UserStatusContext.Provider value={{ isOnline }}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = () => useContext(UserStatusContext);
