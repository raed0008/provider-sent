import * as Location from 'expo-location';
import UseLocation from '../../../utils/useLocation';

export function CalculateTax(orderPrice) {
    // Calculate the tax amount
    const taxAmount = orderPrice * 0.15; // 15% of the order price

    // Return the total price
    return taxAmount;
}
export function calculateTotalWithTax(orderPrice) {
    // Calculate the tax amount
    const taxAmount = orderPrice * 0.15; // 15% of the order price

    // Calculate the total price including the tax
    const totalPrice = orderPrice + taxAmount;

    // Return the total price
    return totalPrice;
}
export async function getZipCode() {
    // Request permission to access location
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
       Alert.alert('Permission to access location was denied');
       throw new Error('Permission to access location was denied');
    }
   
    // Get the current location
    let location = await Location.getCurrentPositionAsync({});
   
    // Get the zip code
    let addresses = await Location.reverseGeocodeAsync(location.coords);
    if (addresses && addresses.length > 0) {
       let zipCode = addresses[0].postalCode;
       return zipCode;
    }
    return null;
   }

   
// Example usage
