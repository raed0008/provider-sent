// // backgroundTask.js
// import { useDispatch } from 'react-redux';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as geolib from 'geolib';
// import Sound from 'react-native-sound';
// import BackgroundTimer from 'react-native-background-timer';
// import { setOrders, setProviderCurrentOffers } from '../../store/features/ordersSlice';
// import { SUPORTED_DISTANCE } from '../../navigation/routes';

// const playSound = async () => {
//   try {
//     const sound = new Sound('https://res.cloudinary.com/dgjgthsst/video/upload/v1720656360/notification_sound_71ffc107e8.mp3', Sound.MAIN_BUNDLE, (error) => {
//       if (error) {
//         console.log('Failed to load the sound', error);
//         return;
//       }
//       sound.setVolume(1.0);
//       sound.play((success) => {
//         if (success) {
//           console.log('Successfully played the sound');
//         } else {
//           console.log('Playback failed due to audio decoding errors');
//         }
//         sound.release();
//       });
//     });
//   } catch (error) {
//     console.log('Error playing sound', error);
//   }
// };

// const fetchData = async (coordinate, refetchOrders, userCategories) => {
//   const newOrdersData = await refetchOrders();
//   if (newOrdersData?.data?.data && coordinate) {
//     if (Array.isArray(newOrdersData?.data?.data)) {
//       const nearOrders = newOrdersData?.data?.data?.filter((item) => {
//         const orderCoordinate = {
//           latitude: item?.attributes?.googleMapLocation?.coordinate?.latitude,
//           longitude: item?.attributes?.googleMapLocation?.coordinate?.longitude,
//         };
//         if (coordinate && orderCoordinate.latitude !== undefined && orderCoordinate.longitude !== undefined) {
//           const distance = geolib.getDistance(coordinate, orderCoordinate);
//           return distance <= SUPORTED_DISTANCE;
//         }
//         return false;
//       });
//       const pendingOrders = nearOrders?.filter(
//         (item) =>
//           item?.attributes?.status === 'pending' &&
//           (item?.attributes?.services?.data?.length > 0 || item?.attributes?.service_carts?.data?.length)
//       );
//       const filteredOrders = pendingOrders?.filter((order) =>
//         userCategories?.data?.filter((category) => {
//           const CartServiceCategoryId = order?.attributes?.service_carts?.data[0]?.attributes?.service?.data?.attributes?.category?.data?.id;
//           return (
//             (order?.attributes?.services?.data[0]?.attributes?.category?.data?.id === category?.id) ||
//             (CartServiceCategoryId === category?.id)
//           );
//         })[0]
//       );
//       return filteredOrders;
//     }
//   }
//   return [];
// };

// export const checkForNewOrdersInBackground = async (dispatch, refetchOrders, userCategories) => {
//   try {
//     const CurrentLocation = await AsyncStorage.getItem('userLocation');
//     if (CurrentLocation) {
//       const locationCoordinate = JSON.parse(CurrentLocation).coordinate;
//       const newOrders = await fetchData(locationCoordinate, refetchOrders, userCategories);
//       if (newOrders.length > 0) {
//         dispatch(setOrders(newOrders));
//         dispatch(setProviderCurrentOffers(newOrders.length));
//         playSound();
//       }
//     }
//   } catch (error) {
//     console.error('Error checking for new orders:', error);
//   }
// };

// export const startBackgroundTask = (dispatch, refetchOrders, userCategories) => {
//   BackgroundTimer.runBackgroundTimer(() => {
//     checkForNewOrdersInBackground(dispatch, refetchOrders, userCategories);
//     console.log('Searching for new orders');
//   }, 5000); // Check every 5 seconds
// };

// export const stopBackgroundTask = () => {
//   BackgroundTimer.stopBackgroundTimer();
// };
