import React, { useEffect, useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useSelector } from 'react-redux';
import { updateUserData } from '../../utils/user';
import { getUserInfoFromLocal, saveUserInfo } from '../utils/Account/helper';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { playSound } from '../component/OrdersListner';

// Define a unique identifier for your task
const UPDATE_USER_STATUS_TASK = 'com.yourapp.updateUserStatus';

// Define the task
TaskManager.defineTask(UPDATE_USER_STATUS_TASK, async () => {
  // Fetch user data
  try {
    let userData = await getUserInfoFromLocal();

    // Update user status
    console.log('this is working in the background now', userData);
    if (userData && userData.id) {
      await updateUserData(userData.id, { online: 'inactive' }); // Assuming you want to set the status to inactive
      return BackgroundFetch?.Result?.NewData;
    } else {
      console.log('User data or ID not found');
      return BackgroundFetch?.Result?.NoData;
    }
  } catch (error) {
    console.log('Error in background task', error);
    return BackgroundFetch?.Result?.Failed;
  }
});


const useUserStatus = () => {
  const user = useSelector((state) => state?.user?.userData);
  const [id,setId] = useState(null)
  useEffect(() => {
    // Register the task
    BackgroundFetch.registerTaskAsync(UPDATE_USER_STATUS_TASK, {
      minimumInterval: 60 * 0.05, // 15 minutes
      stopOnTerminate: false, // android only
      startOnBoot: true, // android only
    });

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App is active: user is online');
        setId(user?.id)
        
        await updateUserData(user?.id, { online: 'active' }); // Assuming you want to set the status to inactive
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App is not active: user is offline');
        // playSound()
        await updateUserData(user?.id, { online: 'inactive' }); // Assuming you want to set the status to inactive
      }
    });

    return () => {
      subscription.remove();
      BackgroundFetch.unregisterTaskAsync(UPDATE_USER_STATUS_TASK);
    };
  }, []);

  return null;
};

export default useUserStatus;
