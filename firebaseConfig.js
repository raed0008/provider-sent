import { getFirestore, initializeFirestore} from 'firebase/firestore';
import { getStorage} from 'firebase/storage';
import {initializeApp} from 'firebase/app';
import { initializeAuth ,getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  EXPO_PUBLIC_FIREBASE_APIKEY,
EXPO_PUBLIC_FIREBASE_AUTHDOMAIN,
EXPO_PUBLIC_FIREBASE_PROJECTID,
EXPO_PUBLIC_FIREBASE_STORAGEBUCKET,
EXPO_PUBLIC_FIREBASE_MESSAGINGSENDERID,
EXPO_PUBLIC_FIREBASE_APPId} from '@env'
export const firebaseConfig = {
    apiKey: EXPO_PUBLIC_FIREBASE_APIKEY,
    authDomain: EXPO_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId:EXPO_PUBLIC_FIREBASE_PROJECTID,
    storageBucket: EXPO_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    appId:EXPO_PUBLIC_FIREBASE_APPId
  };

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
 export  const db = getFirestore(app);
 export  const  FIRE_BASE_Storage = getStorage(app);

  

export default app;
