import * as geolib from "geolib";
import { SUPORTED_DISTANCE } from "../../navigation/routes";
import api from "../../../utils";
// import api from "./index"; // Assume api is set up to make HTTP requests

// const SUPPORTED_DISTANCE = 10000; // Maximum distance in meters

export const isOrderValidForProvider = async (newOrderId, providerCoordinate, userCategories) => {
  try {
    // Fetch order details using the newOrderId
    const response = await api.get(`/api/orders/${newOrderId}`);
    const orderData = response?.data?.data?.attributes;

    if (!orderData || !providerCoordinate) {
      return false;
    }

    // Check if the order is within the supported distance
    const orderCoordinate = orderData.googleMapLocation?.coordinate;
    const isWithinDistance = geolib.getDistance(providerCoordinate, orderCoordinate) <= SUPORTED_DISTANCE;

    if (!isWithinDistance) {
      return false;
    }
    console.log('matched distance is ************************',isWithinDistance)
    // Check if the order's category matches the provider's categories
    const orderCategoryId = orderData?.categoryId;
    const isCategoryMatched = userCategories?.some(category => category?.id === orderCategoryId);

    return isCategoryMatched;

  } catch (error) {
    console.error('Error checking order validity:', error);
    return false;
  }
};