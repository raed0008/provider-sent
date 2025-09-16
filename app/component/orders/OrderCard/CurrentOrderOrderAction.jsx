import React, { memo, useState, useCallback, useEffect } from "react";
import ButtonActionsContainer from "./ButtonActionsContainer";
import { View } from "react-native";

const CurrentOrderOrderAction = ({ item, handleOrderCancle }) => {
  const [seeAdditaionPricePage, setSeeAdditionalPricePage] = useState(false);
  const isOrderContainAdditionalPriceOrSpare = useCallback((item) => {
    return (
      item?.attributes?.service_carts?.data?.some((cart) => {
        const price = cart?.attributes?.service?.data?.attributes?.Price;
        return Number(price) === 0;
      }) || false
    );
  }, []);

  useEffect(() => {
    if (item) {
      const hasAdditionalPrice = isOrderContainAdditionalPriceOrSpare(item);
      setSeeAdditionalPricePage(hasAdditionalPrice);
      console.log("📌 hasAdditionalPrice:", hasAdditionalPrice);
    }
  }, [item, isOrderContainAdditionalPriceOrSpare]);

  return (
    <View>
      <ButtonActionsContainer
        handleOrderCancle={handleOrderCancle}
        seeAdditaionPricePage={seeAdditaionPricePage}
        item={item}
      />
    </View>
  );
};

export default memo(CurrentOrderOrderAction);
