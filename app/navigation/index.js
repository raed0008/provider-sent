import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LogBox } from "react-native";

import LoadingScreen from "../component/loadingScreen";
import SplashScreen from "../screens/splashScreen";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { ADDITION_INFO, BROWSE_ORDERS, CHARGE_WALLET_SCREEN, CHAT_ROOM, CHOOSE_CATEGORIES, PROVIDER_LOCATION, CHOOSE_DCOUMENT, ITEM_DETAILS, ITEM_ORDER_DETAILS, MANUAL_LOCATION_ADD, ORDER_SELECT_LOCATION, ORDER_SELECT_REGION, ORDER_SUCCESS_SCREEN, PAY_AFTER_SERVICES_SCREEN, RATE_CLIENT_sSCREEN, REGISTER_ERROR_DOCS, NO_CONNECTION_SCREEN, CHANGE_ORDER_DATE, ADD_ADDITIONAL_SERVICES_SCREEN, CHAT_ROOM_fireBase, SELECT_LAN, NOTIFICATION_SCREEN, CHARGE_MORE_WALLET, CECKOUT_WEBVIEW_SCREEN, REQUIRED_LOCATION_SCREEN, INACTIVEACCOUNTSCREEN, TABBYCHECKOUT, STCCHECKOUT, CANCEL_ORDER_SCREEN, STC_PAYMENT_SUCCESS } from "./routes";
import ItemScreen from "../screens/Item/ItemScreen";
import ItemOrderDetails from "../screens/Item/ItemOrderDetails";
import OrderCreationSuccess from "../screens/OrderCreationSuccess";
import SlectLocationOrderScreen from "../screens/location/SelectLocationOrderScreen";
import AddManualLocationScreen from "../screens/location/AddManualLocationScreen";
import PaymentScreen from "../screens/payment/paymentScreen";
import SelectRegionScreen from "../screens/RegionScreen";
import ChatNavigator from "./ChatNavigator";
import OrdersScreen from "../screens/OrdersScreen";
import RegisterErrorDocument from "../screens/registerStatus/RegisterErrorDocument";
import ChooseDocumentScreen from "../screens/ResgisterAccount.js/ChooseDocumentScreen";
import AdditionInfoScreen from "../screens/ResgisterAccount.js/AdditionalIInfo";
import ChooseCategories from "../screens/ResgisterAccount.js/ChooseCategories";
import ChargeWalletScreen from "../screens/wallet/ChargeWalletScreen";
import PaymentAfterServiceDetails from "../screens/PaymentAfterServiceDetails";
import CancelOrderScreen from "../screens/CancelOrderScreen";
import StarsComponent from "../component/StarsComponent";
import ProviderLocationScreen from "../screens/location/ProviderLocationScreen";
import NoConnectionScreen from "../screens/NoConnectionScreen";
import ChangeDateOrderScreen from "../screens/Orders/ChangeOrderDate";
import AddAddionalPriceScreen from "../screens/AddAddionalPriceScreen";
import SelectLanguageScreen from "../screens/language/SelectLanugageScreen";
import NotificationScreen from "../screens/Notification/NotificationScreen";
import ChargeMoreWalletScreen from "../screens/wallet/ChargeMoreWalletScreen";
import PaymentWebview from "../screens/payment/PaymentWebview";
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import RequiredLocationScreen from "../screens/RequiredLocationScreen";
import InactiveAccountScreen from "../screens/InactiveAccountScreen";
import ChatRoom from "../screens/firebaseChat/ChatRoom";
import CheckoutScreen from "../screens/payment/tabby/CheckoutScreen";
import StcPayment from "../screens/payment/StcPayment/StcPaymentWebView";
import StcPaymentSuccess from "../screens/payment/StcPayment/StcPaymentSuccess";
LogBox.ignoreAllLogs();

const Stack = createStackNavigator();
const RootNavigator = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isConnected ? (
          <>
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="App" component={AppNavigator} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="Chat" component={ChatNavigator} />
            <Stack.Screen
              name={ITEM_DETAILS}
              component={ItemScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={PROVIDER_LOCATION}
              component={ProviderLocationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={BROWSE_ORDERS}
              component={OrdersScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ITEM_ORDER_DETAILS}
              component={ItemOrderDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ORDER_SUCCESS_SCREEN}
              component={OrderCreationSuccess}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={REGISTER_ERROR_DOCS}
              component={RegisterErrorDocument}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ORDER_SELECT_LOCATION}
              component={SlectLocationOrderScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={RATE_CLIENT_sSCREEN}
              component={StarsComponent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={CHARGE_WALLET_SCREEN}
              component={ChargeWalletScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={CANCEL_ORDER_SCREEN}
              component={CancelOrderScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={CHANGE_ORDER_DATE}
              component={ChangeDateOrderScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={REQUIRED_LOCATION_SCREEN}
              component={RequiredLocationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={INACTIVEACCOUNTSCREEN}
              component={InactiveAccountScreen}
            />
            <Stack.Screen
              name={PAY_AFTER_SERVICES_SCREEN}
              component={PaymentAfterServiceDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ADD_ADDITIONAL_SERVICES_SCREEN}
              component={AddAddionalPriceScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={CHAT_ROOM_fireBase}
              component={ChatRoom}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={TABBYCHECKOUT}
              component={CheckoutScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={STCCHECKOUT}
              component={StcPayment}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={STC_PAYMENT_SUCCESS}
              component={StcPaymentSuccess}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={SELECT_LAN}
              component={SelectLanguageScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={ORDER_SELECT_REGION}
              component={SelectRegionScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name={CHOOSE_CATEGORIES} component={ChooseCategories} />
            <Stack.Screen name={ADDITION_INFO} component={AdditionInfoScreen} />
            <Stack.Screen name={CHOOSE_DCOUMENT} component={ChooseDocumentScreen} />
            <Stack.Screen name={NOTIFICATION_SCREEN} component={NotificationScreen} />
            <Stack.Screen name={CHARGE_MORE_WALLET} component={ChargeMoreWalletScreen} />
            <Stack.Screen name={MANUAL_LOCATION_ADD} component={AddManualLocationScreen} />
            <Stack.Screen name={"Payment"} component={PaymentScreen} />
            <Stack.Screen
              name={CECKOUT_WEBVIEW_SCREEN}
              component={PaymentWebview}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name={NO_CONNECTION_SCREEN}
              component={NoConnectionScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;