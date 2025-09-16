import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import UserLocation from '../../../component/Home/UserLocation'
import AgreamentProminentDisclosureLocation from '../../../component/ProminentDisclosure'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LocationPermissionComponent = () => {
    const [agreamentStatus, setAgreamentStatus] = useState(false);

    useEffect(() => {
        getStatus()
    }, [])
    
    const getStatus = async () => {
        const status = await AsyncStorage.getItem('agreeLocationProminentDisclosure');
        if (status === "true") {
            setAgreamentStatus(true);
        }
    }
    
    return (
        <View>
            {agreamentStatus ? (
                <UserLocation />
            ) : (
                <AgreamentProminentDisclosureLocation 
                    setAgreamentStatus={setAgreamentStatus} 
                />
            )}
        </View>
    )
}

export default LocationPermissionComponent