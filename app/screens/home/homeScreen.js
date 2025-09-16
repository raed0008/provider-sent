import React, { memo, useState } from "react";
import {
  StatusBar,
  View,
  Dimensions,

} from "react-native";


import { Colors } from "../../constant/styles";

import HomeDetails from "./HomeDetails";
import HomeHeader from "./HomeHeader";
import ServicesList from "../../component/Home/ServicesList";
import SwitchStatusCard from "../../component/Home/SwitchStatusCard";
import ProviderSectionCard from "../../component/ProviderHome/ProviderSectionCard";
import { MY_ORDERS } from "../../navigation/routes";
import { useNavigation } from "@react-navigation/native";
import LocationAgreamentComponent from "../../component/LocationAgreamentComponent";
import OrdersListener from "../../component/OrdersListner";
import { Loop } from "../../../utils/ConnectOrders";
import { useNearOrders } from "../../../utils/orders";


const HomeScreen = ({  }) => {
  const navigation = useNavigation()
  const UserListnerUpdater = memo(() => {
    return <OrdersListener/>; // This component does not render anything
  });
  const [refetching,setRefetching] = useState(false)

  return (
    <View style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <HomeHeader />
      <HomeDetails
      refreshing={refetching}
      setRefreshing={setRefetching}
      children={
        <>
        <SwitchStatusCard/>
        <ProviderSectionCard setRefetching={setRefetching}  enableRefetch={refetching} />
        <ServicesList />
        </>
      }/>
      {/* <UserListnerUpdater/> */}
    
     

    </View>
  );
};


export default memo(HomeScreen);
