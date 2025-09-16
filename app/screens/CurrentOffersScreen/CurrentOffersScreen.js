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
import AgreamentProminentDisclosureLocation from '../../component/ProminentDisclosure'
import { useNearOrders } from "../../../utils/orders";
import { EmptyList } from "../OrdersScreen";

const { width, height } = Dimensions.get("screen");

const CurrentOffersScreen = ({ route, subPage }) => {
  const userData = useSelector((state) => state?.user?.userData);
  const [agreamentStatus, setAgreamentStatus] = useState(false)


  useEffect(() => {
    getStatus()
  }, [agreamentStatus])

  const getStatus = async () => {
    const status = await AsyncStorage.getItem('agreeLocationProminentDisclosure');
    if (status === "true") {
      setAgreamentStatus(true);
      console.log("Agreement status set to true"); // Debugging line
    } else {
      console.log("Agreement status not set to true"); // Debugging line
    }
  };


  if (userData?.attributes?.status === "inactive") {
    return <ActiveScreenAlert />;
  }
  return (
    <>
      <MainComponent />
      {
        (agreamentStatus) ?
          <UserLocation />
          :
          <AgreamentProminentDisclosureLocation setAgreamentStatus={setAgreamentStatus} />
      }
    </>
  );
};

const MainComponent = () => {
  const userData = useSelector((state) => state?.user?.userData);
  const [refreshing, setRefreshing] = useState(false);
  const { data, refetch, isLoading, isError } = useNearOrders(userData?.id);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

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
    // ❌ غلط: هذا يلف ErrorScreen داخل View ويسبب الرمادي
    // return (
    //   <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //     <ErrorScreen hanleRetry={refetch} />
    //   </View>
    // );

    // ✅ صح: رجع ErrorScreen مباشرة
    return <ErrorScreen hanleRetry={refetch} />;
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
          <OrdersListComponent orders={data} />
        ) : wallet > 0 ? (
          <ChargeMoreWalletScreen amount={wallet} activation={activation} />
        ) : (
          <ChargeWalletScreen />
        )}
      </ScrollView>

      {/* ✨ اللودينق Overlay يغطي الشاشة كلها */}
      {isLoading && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
            <Text style={styles.loadingText}>جار التحميل...</Text>
          </View>
        </View>
      )}
    </View>
  );
};



const OrdersListComponent = ({ orders }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <View style={{ paddingHorizontal: 10 }}>
          <FlatList
            data={orders}
            inverted={orders?.length > 0}
            keyExtractor={(item) => item.id.toString()}
            removeClippedSubviews={false}
            renderItem={({ item }) => <OrderOfferCard item={item} />}
            ListEmptyComponent={<EmptyList />}
          />
        </View>
      </View>
    </View>
  )
}

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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", // خلفية شفافة مع ظل
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // عشان يكون فوق أي عنصر ثاني
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "transparent", // خلفية شفافة
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // أكبر قيمة عشان يغطي أي شي
    elevation: 9999, // للأندرويد
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default CurrentOffersScreen;