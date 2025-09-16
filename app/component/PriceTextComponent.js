import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import tw from 'twrnc'

import AppText from './AppText'
import { Colors } from '../constant/styles'
import { CURRENCY } from '../navigation/routes'
import useNameInLanguage from '../hooks/useNameInLanguage'
import { useLanguageContext } from '../context/LanguageContext'
import { RFPercentage } from 'react-native-responsive-fontsize'

export default function PriceTextComponent({ price, provider_fee, textStyle, type = '', containerStyle }) {
  const PriceNum = Number(price)
  const ProviderFeeNum = Number(provider_fee)
  const { t } = useTranslation()
  const { name } = useNameInLanguage()
  const { language } = useLanguageContext()

  return (
    <View style={containerStyle}>
      {PriceNum > 0 ? (
        <View style={[tw`flex flex-row gap-2 ${type === 'header' && `bg-[${Colors.primaryColor}] gap-0 `} rounded-full  ${language === 'ar' ? 'flex-row' : 'flex-row'}`, { borderRadius: 150 }]}>
          <AppText
            text={`${PriceNum}`}
            style={[styles.servicePrice, textStyle]} // <-- هنا ندمجها
            centered={true}
          />
          <AppText
            text={`${t(CURRENCY)}`}
            style={[styles.servicePrice, textStyle]} // <-- وهنا برضو
            centered={true}
          />
        </View>
      ) : (
        <AppText
          text={"Price after visit"}
          style={[styles.servicePrice, textStyle]}
          centered={true}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  servicePrice: {
    color: Colors.primaryColor,
  },
})
