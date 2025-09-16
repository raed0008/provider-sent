import { getUserByPhoneNumber } from "../../../utils/user";

export    const fetchData = (async (orders,dispatch,setOrders,generateUserToken,setUserStreamData,userData,setUserData,userRegisterSuccess,refetchOrders,setRefreshing) => {
    try {
        if (orders) {
      dispatch(setOrders(orders));
      setRefreshing(false);
      const chat = generateUserToken(userData);
      dispatch(setUserStreamData(chat));
      if (userData?.attributes?.phoneNumber) {
        const gottenuser = await getUserByPhoneNumber(userData?.attributes?.phoneNumber);
        if (gottenuser) {
          dispatch(setUserData(gottenuser));
          dispatch(userRegisterSuccess(userData));
           
        }
      }
      refetchOrders();
    }
  } catch (error) {
    console.log("error refetch data", error);
  }
}
)

