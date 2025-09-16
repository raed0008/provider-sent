import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerNotificationListeners = async () => {
  // Listener for notifications received while the app is foregrounded
  Notifications?.addNotificationReceivedListener(notification => {
    storeNotification(notification);
  });

  // Listener for interactions with notifications (e.g., user tapped on notification)
  Notifications?.addNotificationResponseReceivedListener(response => {
    storeNotification(response.notification);
  });

  // Listener for notifications received while the app is in the background
  Notifications?.addNotificationReceivedBackgroundListener(notification => {
    storeNotification(notification);
  });

  // Listener for interactions with notifications in the background
  Notifications?.addNotificationResponseReceivedBackgroundListener(response => {
    storeNotification(response.notification);
  });
};

export const storeNotification = async (notification) => {
  if (!notification) {
    console.error('Received a null notification');
    return;
  }

  try {
    const existingNotifications = JSON.parse(await AsyncStorage.getItem('notifications')) || [];
    const updatedNotifications = [...existingNotifications, notification];
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    // Update your notification screen with the new list
    // ...
  } catch (error) {
    console.error("Error storing notification:", error);
  }
};
