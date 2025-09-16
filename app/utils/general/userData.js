import AsyncStorage from "@react-native-async-storage/async-storage"

export const AddUserInfoToStorage = async (data)=>{
    try {
        await AsyncStorage.setItem(userInfo,)
    } catch (error) {
        console.log('error setting the data to the setorage',error)
    }
}