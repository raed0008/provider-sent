import { RefreshControl } from 'react-native';
import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollView } from "react-native-virtualized-view";
import CurrentOrderCard from "../../component/orders/CurrentOrderCard";
import { FlatList } from "react-native";
import { Colors } from "../../constant/styles";
import { useTranslation } from "react-i18next";
import AppText from "../../component/AppText";
import useOrders, { GetProvidersOrders, useCurrentOrders } from "../../../utils/orders";
import LoadingScreen from "../loading/LoadingScreen";
import { COMPLETE_ORDERS_DETAILS, ORDERS_DETAILS } from '../../navigation/routes';
import { setCompleteOrders } from '../../store/features/ordersSlice';
import AnimatedLottieView from 'lottie-react-native';
import { RFPercentage } from "react-native-responsive-fontsize";
import { useLanguageContext } from "../../context/LanguageContext";

const { width, height } = Dimensions.get("screen");

export default function CompletedOrdersScreen({ navigation }) {
  const user = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, isError, refetch } = useCurrentOrders(user?.id, "finished");
  console.log('All orders data:', data); // Debug log to check data
  const filteredData = (data || [])
    // 🟢 نخليها تجيب فقط الطلبات finished
    .filter((order) => order?.attributes?.status === "finished")
    // 🟢 ونفلترها إنها تكون أقل من 30 يوم
    .filter((order) => {
      const createdAt = new Date(order?.attributes?.createdAt);
      const now = new Date();
      const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
      return diffInDays <= 30;
    });

  const { language } = useLanguageContext();
  const { t } = useTranslation();

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      refetch()
      console.log('the referech is setting now ')
    } catch (error) {
      console.log('error referech ', error)
    } finally {
      setRefreshing(false)
    }
  }

  const RenderItem = useCallback(({ item, index }) => {
    console.log('Rendering completed order item:', item);

    if (!item?.id) {
      console.log('Item id is missing:', item);
      return null;
    }

    return (
      <View style={styles.cardWrapper}>
        <CurrentOrderCard
          orderId={item?.id}
          onPress={(order) => {
            navigation.navigate(ORDERS_DETAILS, { orderId: item?.id, item: order })
          }}
          refreshing={refreshing}
          hideActions={true}
          isCompletedScreen={true}
        />


      </View>
    );
  }, [navigation, language, refreshing]);

  if (isLoading) return <LoadingScreen />

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={filteredData}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
        keyExtractor={(item) => item?.id}
        // كل كارد في سطr منفصل
        numColumns={1}
        ListEmptyComponent={
          <CompletedOrdersEmptyList refreshing={refreshing} onRefresh={onRefresh} t={t} />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const CompletedOrdersEmptyList = ({ onRefresh, refreshing, t }) => {
  return (
    <View style={styles.emptyContainer}>
      <AnimatedLottieView
        autoPlay
        source={require('../../assets/empty_orders.json')}
        style={styles.emptyAnimation}
      />
      <AppText
        text={t("There are no Complete orders")}
        style={styles.emptyText}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.04, // حشو جانبي مناسب
    paddingVertical: 10,
  },
  // تعديل الكارد ليأخذ العرض الكامل
  cardWrapper: {
    width: '100%', // العرض الكامل
    marginBottom: 12,
    alignItems: 'flex-end', // محاذاة من اليمين (RTL)
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.whiteColor,
    minHeight: height * 0.7, // 70% من ارتفاع الشاشة
    paddingHorizontal: width * 0.1, // 10% من عرض الشاشة
  },
  emptyAnimation: {
    width: width * 0.7, // 70% من عرض الشاشة
    height: height * 0.4, // 40% من ارتفاع الشاشة
    maxWidth: 300, // حد أقصى للعرض
    maxHeight: 300, // حد أقصى للارتفاع
    aspectRatio: 1, // للحفاظ على النسبة
    marginBottom: 20,
  },
  emptyText: {
    fontSize: RFPercentage(2.8), // زيادة حجم الخط قليلاً
    textAlign: 'center',
    color: Colors.textColor || '#666',
    marginTop: 10,
  }
});