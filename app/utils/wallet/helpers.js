import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserByPhoneNumber } from "../../../utils/user";
import {useState,useEffect} from 'react'
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { useDispatch, useSelector } from "react-redux";
import {setUserData,userRegisterSuccess} from '../../store/features/userSlice.js'
const getUserInfo = async (dispatch) => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const userData = JSON.parse(userDataString);
      const validPhone = `${userData?.phoneNumber?.replace(/\s/g, "").trim()}`;
      const PhoneNumberValidated = convertPhoneTovalid(validPhone);
      if (userData?.phoneNumber) {
        const gottenuser = await getUserByPhoneNumber(PhoneNumberValidated);
        dispatch(setUserData(gottenuser));
        return gottenuser
      } else {
      }
    } catch (error) {
      console.log("error getting the user fo rthe fir", error);
    }
  };
  const convertPhoneTovalid = (phone) => {
    const phoneNumberWithoutPlus = phone?.replace("+", "");

    // Convert the string to a number
    const phoneNumber = Number(phoneNumberWithoutPlus);
    return phoneNumber;
  };
export const useUserData = ()=>{
    const dispatch = useDispatch()
    const [user,setData] = useState()
    useEffect(() => {
      const gottenuser =   getUserInfo(dispatch);
      setData(gottenuser)
      }, [dispatch]);   
    return {
        user
    }
}