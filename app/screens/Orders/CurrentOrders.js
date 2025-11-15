import { RefreshControl } from 'react-native';
import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollView } from "react-native-virtualized-view";
import CurrentOrderCard from "../../component/orders/CurrentOrderCard";
import { FlatList } from "react-native";
import { Colors } from "../../constant/styles";
import AppText from "../../component/AppText";
import useOrders, { GetProvidersOrders, useCurrentOrders } from "../../../utils/orders";
import { ORDERS_DETAILS } from '../../navigation/routes';
import { setcurrentChatChannel } from '../../store/features/ordersSlice';
import AnimatedLottieView from 'lottie-react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import LoadingScreen from '../loading/LoadingScreen';
import { useLanguageContext } from "../../context/LanguageContext";

const { width, height } = Dimensions.get("screen");

export default function CurrentOrders({ navigation }) {
  const user = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false);
  const { data, isError, isLoading, refetch } = useCurrentOrders(user?.id, 'current', refreshing)
  const { language } = useLanguageContext();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      refetch()
    } catch (error) {
      console.log('error referech ', error)
    } finally {
      setRefreshing(false)
    }
  }

  const RenderItem = useCallback(({ item, index }) => {

    if (!item?.id) {
      return null;
    }

    return (
      <View style={styles.cardWrapper}>
        <CurrentOrderCard
          orderId={item?.id}
          onPress={(order) => {
            console.log('ORDERS_DETAILS route:', ORDERS_DETAILS);

            try {
              navigation.navigate(ORDERS_DETAILS,
                { orderId: item?.id, item: order }
              );
              dispatch(setcurrentChatChannel(item?.attributes?.chat_channel_id))
            } catch (error) {
              console.log('Navigation error:', error);
            }
          }}
        />
      </View>
    );
  }, [navigation, language]);

  if (isLoading) return <LoadingScreen />

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={data?.filter(order =>
          order?.attributes?.status !== "finished" &&
          order?.attributes?.status !== "canceled"
        )}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
        keyExtractor={(item) => item?.id}
        numColumns={1}
        ListEmptyComponent={
          <OrderEmptyList refreshing={refreshing} onRefresh={onRefresh} />
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

const OrderEmptyList = ({ onRefresh, refreshing }) => {
  return (
    <View style={styles.emptyContainer}>
      <AnimatedLottieView
        autoPlay
        source={require('../../assets/EmptyCart.json')}
        style={styles.emptyAnimation}
      />
      <AppText
        text={"There are no orders."}
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
    minHeight: height * 0.7,
    paddingHorizontal: width * 0.1,
  },
  emptyAnimation: {
    width: width * 0.7,
    height: height * 0.4,
    maxWidth: 300,
    maxHeight: 300,
    aspectRatio: 1,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: RFPercentage(2.8),
    textAlign: 'center',
    color: Colors.textColor || '#666',
    marginTop: 10,
  }
});