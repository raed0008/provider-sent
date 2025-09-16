import { View, Text, Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import { useLanguageContext } from '../../context/LanguageContext'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { Colors } from '../../constant/styles'
import AppText from '../AppText'
const {width,height } = Dimensions.get('screen')
const LocationTextComponent = ({location}) => {
    const { language} = useLanguageContext()
    const readableLangange = `readable_${language}`

  return (
    <View style={styles.descriptionContainer}>
    <AppText centered={true} text={"address"} style={styles.title} />
    <AppText
      centered={true}
      text={
      location || "not provided"
      }
      style={[styles.price]}
      />
  </View>
  )
}

export default LocationTextComponent
const styles = StyleSheet.create({
    descriptionContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "auto",
        flexWrap:'wrap',
        width: width*0.90 ,
        padding: 10,
        // borderWidth: 0.7,
        borderRadius: 10,
        marginVertical: 10,
        marginLeft: 0,
        marginHorizontal: 4,
        backgroundColor: Colors.whiteColor,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 4,
        gap: 10,
      },
      price: {
        fontSize: RFPercentage(1.8),
        color: Colors.blackColor,
        marginTop: 5,
      },
      title: {
        fontSize: RFPercentage(2.1),
        color: Colors.primaryColor,
      },
});