import {
  View,
  Text,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native-virtualized-view";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import LottieView from "lottie-react-native";
import * as geolib from 'geolib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc'
import ChargeWalletScreen from "./wallet/ChargeWalletScreen";
import ActiveScreenAlert from "./ActiveScreenAlert";
import ChargeMoreWalletScreen from "./wallet/ChargeMoreWalletScreen";
import { ITEM_DETAILS, SUPORTED_DISTANCE } from "../navigation/routes";
import { Colors } from "../constant/styles";
import LoadingScreen from "./loading/LoadingScreen";
import AppText from "../component/AppText";
import useCategories from "../../utils/categories";
import OrderOfferCard from "../component/orders/OrderOfferCard";
import ArrowBack from "../component/ArrowBack";
import useNameInLanguage from "../hooks/useNameInLanguage";
import { useLanguageContext } from "../context/LanguageContext";
import { refresh } from "@react-native-community/netinfo";
import { RFPercentage } from "react-native-responsive-fontsize";
import moment from "moment";
import { getNearOrders, useNearOrders } from "../../utils/orders";

const { width, height } = Dimensions.get("screen");

export default function OrdersScreen({ route, navigation }) {
  const category = route.params?.id;
  const { name: categoryName } = useNameInLanguage()

  const { data: categories, isLoading: loading, isError } = useCategories();
  const AllCategories = categories?.map((category) => {
    return {
      id: category?.id,
      name: category?.attributes[categoryName]
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const userData = useSelector((state) => state?.user?.userData)
  const [refreching, setRefreching] = useState(false)
  const { data: PENDINGORDERS, refetch } = useNearOrders(userData?.id)
  const SelectedCategory = AllCategories?.filter((item) => item?.id == category)[0]
  const NEwPENDINGORDERS = PENDINGORDERS?.filter((order) => {
    return order?.attributes?.categoryId === SelectedCategory?.id
  })

  console.log('//////////////', PENDINGORDERS?.length, category, categories?.length)

  const onRefresh = async () => {
    try {
      setRefreching(true)
      refetch()
    } catch (error) {
      console.log('error refrec new orders', error)
    } finally {
      setRefreching(false)
    }
  }

  if (isLoading || loading) return <LoadingScreen />;
  if (userData?.attributes?.status === "inactive") {
    return <ActiveScreenAlert />;
  }

  return (
    <View style={styles.container}>
      <Header category={SelectedCategory} />

      <FlatList
        data={NEwPENDINGORDERS?.length > 0 && userData?.attributes?.wallet_amount >= userData?.attributes?.activation ? NEwPENDINGORDERS : []}
        ListEmptyComponent={
          <EmptyStateContent
            userData={userData}
            NEwPENDINGORDERS={NEwPENDINGORDERS}
          />
        }
        renderItem={({ item }) => (
          <OrderOfferCard
            onPress={() => navigation.navigate(ITEM_DETAILS, { item })}
            item={item}
          />
        )}
        keyExtractor={(item) => item?.id?.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreching}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const EmptyStateContent = ({ userData, NEwPENDINGORDERS }) => {
  if (NEwPENDINGORDERS?.length > 0) {
    if (userData?.attributes?.wallet_amount >= userData?.attributes?.activation) {
      return null;
    } else if (userData?.attributes?.wallet_amount > 0) {
      return (
        <View style={styles.walletContainer}>
          <ChargeMoreWalletScreen
            amount={Number(userData?.attributes?.wallet_amount ?? 0)}
            activation={Number(userData?.attributes?.activation ?? 0)}
          />
        </View>
      );
    } else {
      return <ChargeWalletScreen />;
    }
  }
  return <EmptyList />;
};

export const EmptyList = () => {
  return (
    <View style={styles.noItemContainer}>
      <LottieView
        autoPlay
        style={styles.emptyAnimation}
        source={require("../assets/empty_orders.json")}
      />
      <AppText
        text={"There are no offers yet"}
        style={styles.emptyText}
      />
    </View>
  )
}

const Header = ({ category }) => {
  const { language } = useLanguageContext()

  return (
    <View style={[styles.header, tw`flex ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`]}>
      <AppText
        text={`${category?.name} `}
        centered={true}
        style={styles.categoryName}
      />
      <ArrowBack />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.03,
    paddingVertical: 10,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: 10,
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
  },
  categoryName: {
    backgroundColor: Colors.piege,
    textAlign: "center",
    color: Colors.primaryColor,
    paddingHorizontal: width * 0.06,
    fontSize: RFPercentage(2.2),
    paddingVertical: 8,
    borderRadius: 15,
    overflow: 'hidden',
    maxWidth: width * 0.7,
  },
  walletContainer: {
    backgroundColor: Colors.whiteColor,
    minHeight: height * 0.7,
    marginTop: 20,
  },
  noItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.7,
    width: '100%',
    backgroundColor: Colors.whiteColor,
    paddingHorizontal: width * 0.1,
  },
  emptyAnimation: {
    width: width * 0.8,
    height: height * 0.45,
    maxWidth: 300,
    maxHeight: 300,
    aspectRatio: 1,
  },
  emptyText: {
    marginTop: 20,
    color: Colors.blackColor,
    fontSize: RFPercentage(2.5),
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
    padding: width * 0.025, // 2.5% من عرض الشاشة
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: Colors.whiteColor,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 4,
  },
  descriptionContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: '100%',
    padding: width * 0.025,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: Colors.whiteColor,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 4,
  },
  price: {
    fontSize: RFPercentage(2.2),
    color: Colors.primaryColor,
    marginTop: 5,
    fontWeight: '700',
  },
  title: {
    fontSize: RFPercentage(2.8),
    color: Colors.primaryColor,
  },
  itemContainer2: {
    flex: 2,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  increaseButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.2, // 20% من عرض الشاشة
    height: 40,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 40,
    marginTop: 4,
    backgroundColor: Colors.primaryColor,
  },
  buttonText: {
    color: Colors.whiteColor,
    fontSize: RFPercentage(1.8),
  },
});