import { View, Text } from 'react-native'
import React from 'react'
import ArrowBack from '../ArrowBack'
import AppText from '../AppText'
import tw from 'twrnc'
import { AntDesign } from "@expo/vector-icons";
import { useSelector } from 'react-redux'
import { updateUserData } from '../../../utils/user'
import { useLanguageContext } from '../../context/LanguageContext'

const NotificationsHeader = ({ onRefresh, length }) => {
  const user = useSelector((state) => state?.user?.userData)
  const {language} = useLanguageContext()

  const DeleteAllNotifications = async () => {
    try {
      const res = await updateUserData(user?.id, {
        notifications: []
      })
      if (res) {

        onRefresh()
      }
    } catch (error) {
      console.log('error delteing the notifications', error)
    }
  }
  return (
    <View style={tw`flex ${language === 'ar' ? 'flex-row':'flex-row-reverse'} justify-between pl-8 items-center`}>

      {
        length > 0 ?
          <AntDesign
            size={20}
            style={{ borderRadius: 17, backgroundColor: 'red', padding: 7, overflow: 'hidden' }}
            name="delete"
            color={'white'}
            onPress={DeleteAllNotifications}


          /> : <View />

      }

      <ArrowBack />
    </View>
  )
}

export default NotificationsHeader