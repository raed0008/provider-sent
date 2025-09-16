import { View, Text, Pressable } from 'react-native'
import React ,{useCallback} from 'react'
import { AntDesign } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import tw from 'twrnc'
import { useLanguageContext } from '../../context/LanguageContext';
import { Colors } from '../../constant/styles';
import AppText from '../../component/AppText';
import { RFPercentage } from 'react-native-responsive-fontsize';
// import AppText from '../AppText';

const LanguageDropDownMenuSelect = () => {
    const { language ,changeLanguage} = useLanguageContext()
    const navigation = useNavigation()
    const handleChangeLanguage = useCallback(
      async() => {
      await  changeLanguage(language === 'en'?'ar':'en')
          
      },
      [],
    )
    
  return (
    <Pressable  onPress={()=>handleChangeLanguage()} style={tw`px-4 py-4 flex gap-2  items-center ${language === 'ar' ?'flex-row':'flex-row-reverse'}`}>
            <AntDesign onPress={()=>handleChangeLanguage()} name="earth" size={RFPercentage(2.5)} color={Colors.primaryColor}/>
            <AppText text={language === 'en' ? 'Arabic':'English'} style={[tw`text-slate-500`,{fontSize:RFPercentage(2)}]}/>
                
            
    </Pressable>
  )
}

export default LanguageDropDownMenuSelect