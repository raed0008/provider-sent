import { SUPORTED_DISTANCE } from "../../navigation/routes";
import { setOrders, setProviderCurrentOffers } from "../../store/features/ordersSlice";
import * as geolib from "geolib";
import { Audio } from 'expo-av';
import { isOrderValidForProvider } from "./helpers";

export const checkForNewOrders = async (newOrderId, refetchOrders, dispatch, locationCoordinate, setRefreshing, setLoading, setEnableRefetch, userCategories) => {
  try {
    const ordersData = await refetchOrders();
    dispatch(setOrders(ordersData?.data));

    // Check if the specific order is valid for the provider
    const isValidOrder = await isOrderValidForProvider(newOrderId, locationCoordinate, userCategories);
    console.log('the current state of validation o this ',isValidOrder)
    if (isValidOrder) {
      console.log('Playing sound in the background for a valid new order');
      playSound();
      dispatch(setProviderCurrentOffers()); // Assuming only one order is checked here
    }

  } catch (error) {
    console.error('Error checking for new orders:', error);
  }
};

export const fetchData = async (coordinate, refetchOrders, setRefreshing, setLoading, setEnableRefetch, userCategories,type) => {
  const newOrdersData = await refetchOrders();
  const dataValue = newOrdersData?.data?.data
  if (dataValue && coordinate) {
    if (Array.isArray(dataValue)) {
       const nearOrders = await  getNearOrdersLocation(dataValue,coordinate)
      const pendingOrders = nearOrders?.filter(
        (item) =>
          item?.attributes?.status === "pending" &&
          (item?.attributes?.services?.data?.length > 0 || item?.attributes?.service_carts?.data?.length)
      );
      const   filteredOrders  = await  getYourNearOrdersMatchCategory(pendingOrders,userCategories,(type || ''))
      console.log('inside the fetching the filter',filteredOrders?.length)
      return filteredOrders;
    }
    setRefreshing(false);
    setEnableRefetch(false);
    setLoading(false);
  }
};

// Configure audio mode for playback
const configureAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.log('Error configuring audio:', error);
  }
};

export const playSound = async () => {
  try {
    // Configure audio mode
    await configureAudio();
    
    // Create and load the sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://res.cloudinary.com/dgjgthsst/video/upload/v1720656360/notification_sound_71ffc107e8.mp3' },
      { 
        shouldPlay: true,
        volume: 1.0,
        isLooping: false 
      }
    );
    
    console.log('Successfully played the sound');
    
    // Clean up after playback is finished
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    
  } catch (error) {
    console.log('Error playing sound:', error);
  }
};

const getNearOrdersLocation = async(orders,coordinate)=>{
    try {
        const nearOrders = orders?.filter((item) => {
            const orderCoordinate = {
              latitude: item?.attributes?.googleMapLocation?.coordinate?.latitude,
              longitude: item?.attributes?.googleMapLocation?.coordinate?.longitude,
            };
            if (coordinate && (orderCoordinate.latitude !== undefined) &&( orderCoordinate.longitude !== undefined)) {
              const distance = geolib.getDistance(coordinate, orderCoordinate);
              return distance <= SUPORTED_DISTANCE;
            }
            return false;
          });
          console.log('the near orders from you is ',nearOrders?.length)
          return nearOrders
    } catch (error) {
        console.log('error get neaer location orders')
    }
}

const getYourNearOrdersMatchCategory = async(pendingOrders,userCategories,type) =>{
    try {
        console.log('the use categoet length ',userCategories?.length)
        const filteredOrders = pendingOrders?.filter((order) => userCategories?.some((category) =>{
            // const categoryType1 =order?.attributes?.services?.data[0]?.attributes?.category?.data?.id
            const categoryType =order?.attributes?.categoryId
            return (categoryType === category?.id) 
          
        }
    ));
    if(type === 'new'){
        if(filteredOrders?.length > 0){
            const now = new Date();
            const recentOrders = filteredOrders?.filter((order) => {
                console.log('the order filtered fro mthe recent is ',order?.attributes?.createdAt)
              const orderCreatedAt = new Date(order?.attributes?.createdAt);
              return (now - orderCreatedAt) / 1000 <= 20;  // check if the order was created within the last 5 seconds
            });
            console.log('the filter recent order lengti is10',recentOrders?.length)
            if (recentOrders.length > 0) {
              console.log('Playing sound in the background for recent orders');
              playSound();
            }
        }
    }

          console.log('the filter your get you order mcathcf gategory',filteredOrders?.length)
          return filteredOrders
    } catch (error) {
        console.log('error getting your near order match category',error)
    }
}