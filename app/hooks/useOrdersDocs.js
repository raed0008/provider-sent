import { useCallback, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debounce } from 'lodash';
import { GetProvidersOrders } from '../../utils/orders';

const CACHE_KEY = 'PROVIDER_ORDERS_CACHE';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const useOrdersDocs = () => {
  const [currentOffers, setCurrentOffers] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [completeOrders, setCompleteOrders] = useState([]);
  const [ordersNumber, setOrdersNumber] = useState('⌛️');
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector((state) => state?.user?.userData);

  const fetchCurrentOrders = useCallback(async () => {
    try {
      console.log('fetching the order date is ')
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          processOrders(data);
          return;
        }
      }

      const CurrentProviderOrders = await GetProvidersOrders(user?.id);
      if (CurrentProviderOrders) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          data: CurrentProviderOrders,
          timestamp: Date.now()
        }));
        processOrders(CurrentProviderOrders);
      }
    } catch (error) {
      console.log('error fetching current ', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  const processOrders = useCallback((orders) => {
    setOrdersNumber(orders.length);
    const unfinishedOrder = orders.filter((order) => order?.attributes?.userOrderRating === null);
    const finishedOrders = orders.filter((order) => order?.attributes?.userOrderRating !== null);

    const mapOrder = (order) => ({
      id: order?.id,
      chat_channel_id: order?.attributes?.chat_channel_id
    });

    setCurrentOrders(unfinishedOrder.map(mapOrder).reverse());
    setCompleteOrders(finishedOrders.map(mapOrder).reverse());
  }, []);

  const debouncedFetch = useMemo(
    () => debounce(fetchCurrentOrders, 500),
    [fetchCurrentOrders]
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      debouncedFetch();
    } catch (error) {
      console.log('error refresh ', error);
    }
  }, [debouncedFetch]);

  useEffect(() => {
    fetchCurrentOrders();
  }, [fetchCurrentOrders]);

  return {
    currentOrders,
    completeOrders,
    totalOrders: ordersNumber,
    onRefresh,
    refreshing
  };
};

export default useOrdersDocs;