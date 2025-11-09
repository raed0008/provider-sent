import React, { useState, useEffect } from "react";
import ButtonActionsContainer from "./ButtonActionsContainer";
import { View } from "react-native";
import { useSelector } from "react-redux";

const CurrentOrderOrderAction = ({ item, handleOrderCancle }) => {
  const user = useSelector((state) => state.user.user);
  const [seeAdditaionPricePage, setSeeAdditionalPricePage] = useState(false);

  const isOrderContainAdditionalPriceOrSpare = (item) => {
    return (
      item?.attributes?.service_carts?.data?.some((cart) => {
        const price = cart?.attributes?.service?.data?.attributes?.Price;
        return Number(price) === 0;
      }) || false
    );
  };

  useEffect(() => {
    if (item) {
      const hasAdditionalPrice = isOrderContainAdditionalPriceOrSpare(item);
      setSeeAdditionalPricePage(hasAdditionalPrice);
      console.log("📌 hasAdditionalPrice:", hasAdditionalPrice);
    }
  }, [item]);

  const handleCancelWithProviderId = () => {
    if (handleOrderCancle) handleOrderCancle(item, user?.id);
  };

  return (
    <View>
      <ButtonActionsContainer
        handleOrderCancle={handleCancelWithProviderId}
        seeAdditaionPricePage={seeAdditaionPricePage}
        item={item}
      />
    </View>
  );
};

export default CurrentOrderOrderAction;
