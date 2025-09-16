// import { View, Text } from 'react-native'
// import React, {useRef, useState,useEffect,useCallback} from 'react'
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchData, getNearOrdersLocation } from '../component/orderLisnerHelpers/utils';
// import { setOrders } from '../store/features/ordersSlice';
// import { generateUserToken } from '../screens/chat/chatconfig';
// import { setUserData, setUserStreamData, userRegisterSuccess } from '../store/features/userSlice';
// import useOrders, { usePendingOrders } from '../../utils/orders';
// import { useTranslation } from 'react-i18next';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const usePendingOrderInfoData = () => {
//   const dispatch = useDispatch();
//   const { data: orders, isError: error, refetch: refetchOrders, isLoading } = useOrders();
//   const [refreshing, setRefreshing] = useState(false);
//   const userData = useSelector((state) => state?.user?.userData);
//   const pendingOrders = useSelector((state)=>state?.orders?.orders)
//   const [coordinate,setLocationCorrdinate] = useState(null)
//   const userCategories =userData?.attributes?.categories?.data

//   const [loading,setLoading] = useState(false)
//   const [enableRefetch, setEnableRefetch] = useState(false);

//   const GetTheOrder = useCallback(async (orders)=>{
//     try {
//       setRefreshing(true);
//       await fetchOrders()
      
//     } catch (error) {
//       console.log('errpr fetjcomg tje prders')
//     }
//   },[])
//   useEffect(() => {
//     GetTheOrder(orders)
//   }, [orders?.data])

//   const onRefresh = useCallback(async() => {
//     setRefreshing(true);
//     await fetchOrders()
//      }, [orders])
//   const fetchOrders = async()=>{
//     try {
//       const CurrentLocation = await AsyncStorage.getItem("userLocation");
//       if (CurrentLocation) {
//         const coordinate = JSON.parse(CurrentLocation).coordinate;
//         setLocationCorrdinate(coordinate);
//        await  fetchData(coordinate, refetchOrders, setRefreshing, setLoading, setEnableRefetch, userCategories,'',dispatch);
//       }
//     } catch (error) {
//       console.log(error);
//     }finally{
//       setRefreshing(false)
//     }
//   }
//   return (
//    {
//     isLoading,
//     refreshing,
//     onRefresh,
//     error,
//     refetchOrders
//    }
//   )
// }

// export default usePendingOrderInfoData