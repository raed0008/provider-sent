
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { setOrders, setProviderCurrentOffers } from '../store/features/ordersSlice';
import { useNearOrders } from '../../utils/orders';
import { EXPO_PUBLIC_BASE_URL } from '@env';
import { playSound } from './orderLisnerHelpers/utils';

export default function OrdersListener() {
  const userData = useSelector((state) => state.user.userData);
  const [socket, setSocket] = useState(null);
  const [locationCoordinate, setLocationCoordinate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const { data, isLoading, refetch } = useNearOrders(userData?.id);

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const newSocket = io(EXPO_PUBLIC_BASE_URL);
        newSocket.on('order:create', async (data) => {
          const orderId = data?.data?.id;
          console.log('New order created:', orderId);
        
          try {
            await refetch();
            if (data.data.length > prevOrderCount) {
              playSound(); // Play a sound to notify the user
              setPrevOrderCount(data.data.length);
            }
          } catch (error) {
            console.error('Error checking for new orders:', error);
          }
        });

        setSocket(newSocket);

        return () => {
          if (newSocket) {
            newSocket.off('order:create');
            newSocket.disconnect();
          }
        };
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
      }
    };

    initWebSocket();
  }, [locationCoordinate, prevOrderCount]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await refetch();
        setLoading(false);
        setPrevOrderCount(data?.length);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refetch, data]);

  return null;
}