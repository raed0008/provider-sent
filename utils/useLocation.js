import { Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateUserData } from './user';
import { useLanguageContext } from '../app/context/LanguageContext';

export default function UseLocation() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const userData = useSelector((state) => state?.user?.userData);
  const [locationCoordinate, setLocationCoordinate] = useState(null);
  const { t } = useTranslation();
  const [zipCode, setZipCode] = useState(null);
  const { language } = useLanguageContext(); // 'ar' or 'en'

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let { canAskAgain } = await Location.getForegroundPermissionsAsync();

      if (!canAskAgain && status !== 'granted') {
        Alert.alert(
          t('Your site is not accessible'),
          t('To enable access, go to Settings > Privacy > Location and turn on Location Access feature to keep you informed'),
          [
            { text: t('Cancel'), onPress: () => {}, style: 'cancel' },
            { text: t('Settings'), onPress: () => Linking.openSettings() },
          ],
          { cancelable: false }
        );
        return;
      } else if (canAskAgain && status !== 'granted') {
        Alert.alert(
          t('Permission Required'),
          t('This app requires access to your location.'),
          [
            { text: t('Cancle'), onPress: () => {}, style: 'cancel' },
            { text: t('Allow'), onPress: () => requestLocationPermission() },
          ],
          { cancelable: false }
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setLocationCoordinate(JSON.stringify(coordinate));
      handleSetCurrentLocation(coordinate);
    } catch (error) {
      console.log('error requesting the location', JSON.stringify(error.message));
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, [language]); // Run effect when the language changes

  const handleSetCurrentLocation = async (coordinate) => {
    try {
      const readableLocation = await reverseGeoCode(coordinate, language);
      if (readableLocation) {
        const formattedLocation = getAddressFromObject(readableLocation);
        setCurrentLocation({
          readable: formattedLocation,
          coordinate,
        });
        setZipCode(readableLocation?.postalCode);

        await AsyncStorage.setItem('userLocation', JSON.stringify({
          readable: formattedLocation,
          coordinate,
          language, // Store the language with the location data
        }));

        // if (!userData?.location || userData?.googleMapLocation !== formattedLocation) {
          await updateUserData(userData?.id, {
            googleMapLocation: {
              readable: formattedLocation,
              coordinate,
            },
          });
         
      }
    } catch (error) {
      console.log('handleSetCurrentLocation', JSON.stringify(error.message));
    }
  };

  const reverseGeoCode = async (location, lang) => {
    try {
      const reverseGeocodeAddress = await Location.reverseGeocodeAsync({
        longitude: location?.longitude,
        latitude: location?.latitude,
        
      }, { lang: lang });
      // console.log('the reversed address',reverseGeocodeAddress)
      return reverseGeocodeAddress[0];
    } catch (error) {
      console.log('reverseGeoCode', JSON.stringify(error.message));
    }
  };

  const getAddressFromObject = (locationObject) => {
    const {
      city,
      country,
      region,
      street,
      streetNumber,
      subregion,
    } = locationObject;

    let address = '';
    if (streetNumber) {
      address += ` ${streetNumber}`;
    }
    if (city || subregion) {
      address += `, ${city || subregion}`;
    }
    if (region) {
      address += `, ${region}`;
    }
    if (country) {
      address += `, ${country}`;
    }

    return address;
  };

  return {
    location: currentLocation,
    coordinate: locationCoordinate,
    zipCode: zipCode,
  };
}
