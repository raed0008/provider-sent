// import { useState, useEffect, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { useDispatch } from 'react-redux';
// import useOrders from '../../utils/orders';

// const useCurrentOrders = () => {
//  const user = useSelector((state) => state?.user?.userData);
//  const dispatch = useDispatch()
//  const ordersRedux = useSelector((state) => state?.orders?.orders);
//  const [refreshing, setRefreshing] = useState(false);
// const [currentOrders,setCurrentData]=useState([])
// // const { data ,isLoading,refetch}=useOrders()

// console.log("hook is working")
// const fetchData = 
// useCallback(()=>{
//    const userId = user?.id;
//    if (Array.isArray(ordersRedux?.data)) {
//    const orders = ordersRedux?.data?.filter((item)=>item?.attributes?.provider?.data?.id === userId && item?.attributes?.status !== "canceled")
//    const otherordes = data?.data?.filter((item)=>item?.attributes?.provider?.data?.id === userId)
//    const currentOrders = orders?.filter((item)=>item?.attributes?.userOrderRating === null )
//    // console.log("the all curennt ",currentOrders)
//    setCurrentData(currentOrders)
//    setRefreshing(false);
//    refetch()
//    }
//  },[data])
// // Depend on user to refetch when user changes

//  return { currentOrders, refreshing, setRefreshing, fetchData };
// };

// export default useCurrentOrders;