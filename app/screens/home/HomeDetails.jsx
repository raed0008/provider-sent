import {
  StyleSheet,
  RefreshControl,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
} from "react-native";

import { ScrollView } from "react-native-virtualized-view";

import { Colors } from "../../constant/styles";
import AppHeader from "../../component/AppHeader";
import { setOrders } from "../../store/features/ordersSlice";
import LoadingScreen from "../loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";
import useOrders from "../../../utils/orders";
import ProviderSectionCard from "../../component/ProviderHome/ProviderSectionCard";
import { CURRENCY, MY_ORDERS } from "../../navigation/routes";
import { generateUserToken } from "../chat/chatconfig";
import { setUserData, setUserStreamData, userRegisterSuccess } from "../../store/features/userSlice";
import ServicesList from "../../component/Home/ServicesList";
import AppText from "../../component/AppText";
import { getUserByPhoneNumber, updateUserData } from "../../../utils/user";
import CustomSwitch from "../../component/Home/CustomSwitch";
import SwitchStatusCard from "../../component/Home/SwitchStatusCard";
import LocationAgreamentComponent from "../../component/LocationAgreamentComponent";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState, useCallback, useEffect, Children, memo } from "react";
import { useTranslation } from "react-i18next";
import { fetchData } from "./helpers";

const { width, height } = Dimensions.get("screen");

const HomeDetails = ({ children ,setRefreshing,refreshing}) => {
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
  }, [])


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {children}
    </ScrollView>
  )
}

export default memo(HomeDetails)