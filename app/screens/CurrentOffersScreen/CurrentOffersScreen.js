import React, { useCallback, useEffect, useState } from "react";
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ScrollView } from "react-native-virtualized-view";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/index";

import { ActivityIndicator } from "react-native";
import { Colors, Sizes } from "../../constant/styles";
import OrderOfferCard from "../../component/orders/OrderOfferCard";
import { ITEM_DETAILS } from "../../navigation/routes";
import { ErrorScreen } from "../Error/ErrorScreen";
import LoadingScreen from "../loading/LoadingScreen";
import ChargeWalletScreen from "../wallet/ChargeWalletScreen";
import ActiveScreenAlert from "../ActiveScreenAlert";
import ChargeMoreWalletScreen from "../wallet/ChargeMoreWalletScreen";
import UserLocation from "../../component/Home/UserLocation";
import AgreamentProminentDisclosureLocation from "../../component/ProminentDisclosure";
import { EmptyList } from "../OrdersScreen";
import SuspendedScreen from "../account/SuspendedScreen";

const { width, height } = Dimensions.get("screen");

const CurrentOffersScreen = ({ route, subPage }) => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state?.user?.userData);
  const [agreamentStatus, setAgreamentStatus] = useState(false);
  const [ModalisLoading, setModalIsLoading] = useState(false);

  useEffect(() => {
    getStatus();
  }, [agreamentStatus]);

  const getStatus = async () => {
    const status = await AsyncStorage.getItem(
      "agreeLocationProminentDisclosure"
    );
    if (status === "true") setAgreamentStatus(true);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/${userData?.id}?populate=*`
      );
      const result = await response.json();
      dispatch({ type: "SET_USER_DATA", payload: result });
    } catch (error) {
      
    }
  };

  useEffect(() => {
    const userInterval = setInterval(() => {
      fetchUserData();
    }, 10000);

    return () => clearInterval(userInterval);
  }, []);

  if (userData?.attributes?.status === "inactive") {
    return <ActiveScreenAlert />;
  }

  if (userData?.attributes?.is_banned) {
    
    return <SuspendedScreen isBanned={true} />;
  }

  if (userData?.attributes?.is_suspended) {
    const endTime = new Date(userData?.attributes?.suspension_end_at);
    const now = new Date();
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

    if (remainingSeconds <= 0) {
      
      return (
        <>
          <MainComponent
            ModalisLoading={ModalisLoading}
            setModalIsLoading={setModalIsLoading}
          />
          {agreamentStatus ? (
            <UserLocation />
          ) : (
            <AgreamentProminentDisclosureLocation
              setAgreamentStatus={setAgreamentStatus}
            />
          )}
        </>
      );
    }

    
    return <SuspendedScreen duration={remainingSeconds} />;
  }

  return (
    <>
      <MainComponent
        ModalisLoading={ModalisLoading}
        setModalIsLoading={setModalIsLoading}
      />
      {agreamentStatus ? (
        <UserLocation />
      ) : (
        <AgreamentProminentDisclosureLocation
          setAgreamentStatus={setAgreamentStatus}
        />
      )}
    </>
  );
};

// دالة haversine لحساب المسافة
const haversine = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // نصف قطر الأرض بالأمتار
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// دالة getNearOrdersFast المحلية والمحسّنة
const getNearOrdersFast = async (providerId) => {
  try {
    const providerRes = await api.get(`/api/providers/${providerId}?populate=*`);
    const provider = providerRes?.data?.data?.attributes;
    if (!provider) return [];

    const providerLoc = provider?.googleMapLocation?.coordinate;
    if (!providerLoc) return [];

    const maxDistance = provider?.distance ?? 60000;

    // نجلب البيانات الأساسية فقط مع populate أخف
    const ordersRes = await api.get(
      `/api/orders?filters[status][$eq]=pending&populate[services][populate][category][populate]=image&populate[service_carts][populate][service][populate][category]=*&populate[googleMapLocation]=*&populate[user]=*&populate[orderImages]=*`
    );

    const allOrders = ordersRes?.data?.data || [];
    const allowedCategories =
      provider?.categories?.data?.map((c) => c.id) || [];

    // فلترة بناءً على المسافة والفئات
    const nearbyOrders = allOrders.filter((order) => {
      const attr = order.attributes;
      const orderLoc = attr?.googleMapLocation?.coordinate;
      if (!orderLoc || !attr.categoryId) return false;
      if (!allowedCategories.includes(attr.categoryId)) return false;

      const distance = haversine(
        { lat: providerLoc.latitude, lon: providerLoc.longitude },
        { lat: orderLoc.latitude, lon: orderLoc.longitude }
      );

      return distance <= maxDistance;
    });

    return nearbyOrders.reverse();
  } catch (error) {
    console.log("❌ Error in getNearOrdersFast:", error.message);
    return [];
  }
};

const MainComponent = ({ ModalisLoading, setModalIsLoading }) => {
  const userData = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshKey, setAutoRefreshKey] = useState(0);
  
  // استخدام useQuery مباشرة بدلاً من useNearOrders
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["NearOrdersFast", userData?.id],
    queryFn: () => getNearOrdersFast(userData?.id),
    staleTime: 60 * 1000,
    refetchInterval: 10000,
    enabled: !!userData?.id,
  });

  useEffect(() => {
    console.log("👤 Provider Data:", JSON.stringify(userData?.attributes, null, 2));
  }, [userData]);

  const isSuspended = userData?.attributes?.is_suspended;
  const suspensionDuration = Number(
    userData?.attributes?.suspension_duration ?? 0
  );

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/${userData?.id}?populate=*`
      );
      const result = await response.json();

      
      dispatch({
        type: "SET_USER_DATA",
        payload: result,
      });
    } catch (error) {
      
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      await refetch();
      setAutoRefreshKey(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    const userInterval = setInterval(() => {
      fetchUserData();
    }, 10000);

    return () => clearInterval(userInterval);
  }, []);

  const onRefresh = () => {
    try {
      refetch();
      setRefreshing(true);
    } catch (error) {
      console.log("error onRefresh");
    } finally {
      setRefreshing(false);
    }
  };

  if (isError) {
    return <ErrorScreen hanleRetry={refetch} />;
  }

  
  if (userData?.attributes?.is_banned) {
    return <SuspendedScreen isBanned={true} />;
  }

  if (isSuspended) {
    const endTime = new Date(userData?.attributes?.suspension_end_at);
    const now = new Date();
    const remainingSeconds = Math.max(
      0,
      Math.floor((endTime - now) / 1000)
    );

    if (remainingSeconds <= 0) {
      
    } else {
      return <SuspendedScreen duration={remainingSeconds} />;
    }
  }

  const activation = Number(userData?.attributes?.activation ?? 0);
  const wallet = Number(userData?.attributes?.wallet_amount ?? 0);
  const missingAmount = Math.max(0, activation - wallet);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.primaryColor} />

      {/* المحتوى الأساسي */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: Colors.whiteColor,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {missingAmount === 0 ? (
          <OrdersListComponent
            key={autoRefreshKey}
            orders={data}
            setModalIsLoading={setModalIsLoading}
          />
        ) : wallet > 0 ? (
          <ChargeMoreWalletScreen amount={wallet} activation={activation} />
        ) : (
          <ChargeWalletScreen />
        )}
      </ScrollView>

      {(isLoading || ModalisLoading) && (
        <View style={styles.overlay}>
          <View style={styles.box}>
            <LoadingScreen />
          </View>
        </View>
      )}
    </View>
  );
};

const OrdersListComponent = ({ orders, setModalIsLoading }) => {
  const navigation = useNavigation();
  
  
  useEffect(() => {
    if (orders?.length > 0) {
      orders.forEach((item, index) => {
      });
    }
  }, [orders]);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <View style={{ paddingHorizontal: 10 }}>
          <FlatList
            data={orders}
            inverted={orders?.length > 0}
            keyExtractor={(item) => item.id.toString()}
            removeClippedSubviews={false}
            renderItem={({ item }) => (
              <OrderOfferCard
                item={item}
                setModalIsLoading={setModalIsLoading}
              />
            )}
            ListEmptyComponent={<EmptyList />}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  listContainer: {
    display: "flex",
    paddingTop: 15,
    width: width * 1,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  item: {
    height: 50,
    borderRadius: 8,
    width: "auto",
    paddingHorizontal: 18,
    backgroundColor: Colors.blackColor,
    marginLeft: 15,
    display: "flex",
    justifyContent: "center",
  },
  activeItem: {
    height: 50,
    borderRadius: 8,
    width: "auto",
    paddingHorizontal: 18,
    backgroundColor: Colors.primaryColor,
    marginLeft: 15,
    display: "flex",
    justifyContent: "center",
  },

  animatedView: {
    backgroundColor: "#333333",
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    borderRadius: Sizes.fixPadding + 5.0,
    paddingHorizontal: Sizes.fixPadding + 5.0,
    paddingVertical: Sizes.fixPadding,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 18,
    color: Colors.blackColor,
    paddingHorizontal: 18,
  },
  RegionHeader: {
    fontSize: 22,
    color: Colors.primaryColor,
    paddingHorizontal: 18,
  },
  noItemContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.9,
    width: width,
    backgroundColor: Colors.whiteColor,
  },
  loadingOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  box: {
    width: width * 0.6,
    height: 180,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
});

export default CurrentOffersScreen;
