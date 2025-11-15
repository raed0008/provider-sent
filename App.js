import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Alert, AppState, Dimensions, Linking, Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AnimatedSplash from "react-native-animated-splash-screen";
import { memo } from 'react'
import api from "./utils/index";
import { EXPO_PUBLIC_TABBY_KEY } from '@env'
import { Tabby } from 'tabby-react-native-sdk';
import { SafeAreaView } from "react-native";
import Toast from "react-native-toast-message";
import toastConfig from "./toast.config";
import { Provider, useDispatch, useSelector } from "react-redux";

import RootNavigator from "./app/navigation";
import store from "./app/store";
import { Colors } from "./app/constant/styles";
import { LanguageProvider, useLanguageContext } from "./app/context/LanguageContext";
import * as Updates from 'expo-updates'
import LocationPermissionComponent from "./app/screens/ResgisterAccount.js/LocationPermission/LocationPermissionComponent";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import ForceUpdateModal from "./app/screens/ForceUpdateScreen";
import { checkForceUpdate, updateProviderData } from "./utils/user";
import Constants from "expo-constants";
const currentVersion = Constants.expoConfig.version;

const { width, height } = Dimensions.get("screen");
export const client = new QueryClient();

// إعداد سلوك الإشعارات
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// إعداد notification channel للأندرويد
if (Platform.OS === 'android') {
  // قناة افتراضية
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });

  // قناة الطلبات
  Notifications.setNotificationChannelAsync('orders', {
    name: 'طلبات',
    sound: 'ordersound',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    ongoing: true,
  });

  // قناة التسجيل
  Notifications.setNotificationChannelAsync('register', {
    name: 'تسجيل',
    sound: 'registration',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    ongoing: true,
  });
}


Tabby.setApiKey(EXPO_PUBLIC_TABBY_KEY);

const App = () => {
  const [loading, setLoading] = useState(false);
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false);

  // تحسين getToken مع logs أوضح
  useEffect(() => {
    const getToken = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        console.log("🔐 Notification permission status:", status);

        if (status !== 'granted') {
          const request = await Notifications.requestPermissionsAsync();
          console.log("📩 Permission requested, new status:", request.status);
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        console.log("🎯 Expo Push Token:", tokenData.data);
      } catch (error) {
        console.error("❌ Error while getting Expo Push Token:", error);
      }
    };
    getToken();
  }, []);

  // إضافة listeners للإشعارات
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("📩 إشعار استلمه التطبيق (Foreground):", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("🕹 المستخدم تفاعل مع الإشعار:", response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const askPermission = async () => {
      if (Platform.OS === 'android') {
        const settings = await Notifications.getPermissionsAsync();
        if (settings.status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      }
    };
    askPermission();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
    }, 500);
  }, [])

  useEffect(() => {
    checkForReview();
    trackAppLaunch();
  }, []);

  // طلب إذن الإشعارات بعد 10 ثواني
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        // التحقق من حالة الإذن الحالية
        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        // إذا كان الإذن مُعطى مسبقاً، لا نطلب مرة أخرى
        if (existingStatus === 'granted') {
          return;
        }

        // التحقق من AsyncStorage إذا تم طلب الإذن مسبقاً
        const hasRequestedBefore = await AsyncStorage.getItem('notificationPermissionRequested');
        if (hasRequestedBefore === 'true') {
          return;
        }

        // طلب الإذن الافتراضي من النظام مباشرة
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });

        await AsyncStorage.setItem('notificationPermissionRequested', 'true');
        setNotificationPermissionRequested(true);

        if (status === 'granted') {
          console.log('تم منح إذن الإشعارات');
        } else {
          console.log('تم رفض إذن الإشعارات');
        }
      } catch (error) {
        console.error('خطأ في طلب إذن الإشعارات:', error);
      }
    };

    // طلب الإذن بعد 10 ثواني من تحميل التطبيق
    const timer = setTimeout(() => {
      if (loading) {
        requestNotificationPermission();
      }
    }, 10000); // 10 ثواني

    return () => clearTimeout(timer);
  }, [loading]);

  const trackAppLaunch = async () => {
    try {
      const launchCount = await AsyncStorage.getItem('appLaunchCount');
      const count = launchCount ? parseInt(launchCount) + 1 : 1;
      await AsyncStorage.setItem('appLaunchCount', count.toString());
    } catch (error) {
      console.error("Error tracking app launch:", error);
    }
  };

  const shouldAskForReview = async () => {
    try {
      const launchCount = await AsyncStorage.getItem('appLaunchCount');
      const count = launchCount ? parseInt(launchCount) : 0;
      if (count < 5) return false;
      const lastReviewRequest = await AsyncStorage.getItem('lastReviewRequest');
      if (!lastReviewRequest) return true;
      const lastDate = new Date(lastReviewRequest);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 7;
    } catch (error) {
      console.error("Error checking review timing:", error);
      return false;
    }
  };

  const logReviewAttempt = async () => {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem('lastReviewRequest', now);
    } catch (error) {
      console.error('Error logging review attempt:', error);
    }
  };

  const askForReview = async () => {
    if (Platform.OS === 'ios') {
      try {
        if (await StoreReview.isAvailableAsync()) {
          await StoreReview.requestReview();
          await logReviewAttempt();
          return;
        }
      } catch (error) {
        console.log("Error with iOS review:", error);
      }
    }
    // حل بديل لكل الأجهزة
    const storeUrl = Platform.select({
      ios: "itms-apps://itunes.apple.com/app/6498982246",
      android: "market://details?id=com.njik.nijkProvider",
    });
    Alert.alert(
      "هل تستمتع باستخدام التطبيق؟",
      "إذا أعجبك التطبيق، يمكنك تقييمه في المتجر!",
      [
        { text: "لاحقًا", style: "cancel" },
        {
          text: "قيم التطبيق",
          onPress: () => {
            logReviewAttempt();
            Linking.openURL(storeUrl);
          }
        },
      ]
    );
  };

  const checkForReview = async () => {
    const shouldAsk = await shouldAskForReview();
    if (shouldAsk) {
      setTimeout(() => {
        askForReview();
      }, 2000);
    }
  };

  // طباعة قنوات الإشعارات للأندرويد مرة واحدة عند تشغيل التطبيق
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(channels => {
      });
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={client}>
          <LanguageProvider>
            <SafeAreaProvider style={{ flex: 1 }}>
              <MainComponent loading={loading} />
            </SafeAreaProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

const MainComponent = memo(({ loading }) => {
  const { direction } = useLanguageContext();
  const insets = useSafeAreaInsets();
  const [forceUpdate, setForceUpdate] = useState(false);

  const provider = useSelector((state) => state.user?.userData);
  const providerId = provider?.id;

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        if (!providerId) return;
        const data = await checkForceUpdate(providerId);
        if (!data) return;

        const version = Constants.expoConfig.version;
        const minRequired = data?.min_required_version;

        let shouldForceUpdate = false;

        if (data?.Force_update && minRequired) {
          // تحويل النسخ إلى arrays من الأرقام للمقارنة الصحيحة
          const current = version.split('.').map(Number);
          const required = minRequired.split('.').map(Number);
          
          // مقارنة كل جزء من النسخة
          for (let i = 0; i < Math.max(current.length, required.length); i++) {
            const curr = current[i] || 0;
            const req = required[i] || 0;
            
            if (req > curr) {
              shouldForceUpdate = true;
              break;
            } else if (req < curr) {
              break;
            }
          }
        }

        setForceUpdate(shouldForceUpdate);

        await updateProviderData(providerId, { App_version: version });
      } catch (err) {
        console.log("❌ Error checking force update:", err);
      }
    };

    checkUpdate();
  }, [providerId]);

  return (
    <AnimatedSplash
      isLoaded={loading}
      logoImage={require("./app/assets/images/splash2.png")}
      backgroundColor={Colors.whiteColor}
      logoHeight={height}
      logoWidth={width}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.whiteColor,
          direction,
          paddingTop: Platform.OS === "android" ? insets.top : 0,
          paddingBottom: Platform.OS === "android" ? insets.bottom : 0,
        }}
      >
        {/* ✅ البانر يطلع فوق كل الشاشات */}
        {forceUpdate && <ForceUpdateModal />}

        <RootNavigator />
        <Toast
          position="top"
          topOffset={insets.top + 20}
          config={toastConfig}
        />
      </SafeAreaView>
    </AnimatedSplash>
  );
});
