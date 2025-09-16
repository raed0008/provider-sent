import { View, StyleSheet, Dimensions } from 'react-native'
import React, { memo } from 'react'
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Colors } from '../../constant/styles';
import PriceTextComponent from '../../component/PriceTextComponent';
import AppText from '../../component/AppText';
import { useLanguageContext } from '../../context/LanguageContext';
import useNameInLanguage from '../../hooks/useNameInLanguage';
const { width, height } = Dimensions.get('screen')
const CartItemComponent = ({item}) => {
    const {name:itemName} = useNameInLanguage()
    const { language } = useLanguageContext()
  return (
    <View
    style={styles.itemStyles}
  >
    <AppText
      centered={true}
      text={item?.attributes?.service?.data?.attributes[itemName]}
      style={[styles.name, { fontSize: RFPercentage(1.65), paddingRight: 10, paddingTop: 10,maxWidth:'53%' }]}
    />
    <View style={styles.CartServiceStylesContainer}>
      {/* <PriceTextComponent
      type='header'
        style={styles.priceTextStyles}
        price={item?.attributes?.service?.data?.attributes?.Price}
      /> */}
      <AppText
        style={styles.qtyStyles}
        text={`x${item?.attributes?.qty}`}
      />
    </View>
  </View>
  )
}
const styles = StyleSheet.create({
    itemContainer: {
        display: "flex",
        height: "auto",
        flexDirection: "row",
        alignItems: "center",
        width: width * 0.9,
        padding: 10,
        borderRadius: 10,
        // marginVertical: 10,
        backgroundColor: Colors.whiteColor,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    
        elevation: 3,
      },
      name: {
        fontSize: RFPercentage(1.7),
        color: Colors.blackColor,
        textAlign:'left'
      }, CartServiceStylesContainer: {
        display: 'flex',
        flexDirection: 'row',
        borderWidth: 0.5,
        padding: 5,
        borderRadius: 10,
        paddingHorizontal:10,
        gap:5,
        // height:100,
        // width:100,        gap: 4,
        borderColor: Colors.whiteColor
      },
      listStyles:{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: 15,
        gap: 15,
        width: width*0.90,
      },
      itemStyles:{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
        // flexWrap: 'wrap',
        maxWidth: width * 0.90,
        // backgroundColor:"blue",
        
        gap: 15,
      },
      Xsign:{
        backgroundColor: Colors.whiteColor,
        fontSize: RFPercentage(1.8),
        padding: 6,
        borderRadius: 10,
        overflow:"hidden",

        paddingHorizontal: 15,
        color: Colors.primaryColor,
      },
      qtyStyles:{
        backgroundColor: Colors.primaryColor,
        fontSize: RFPercentage(1.9),
        padding: 2,
        borderRadius: 15,
        overflow:"hidden",

         paddingHorizontal: 15,
        color: Colors.whiteColor,
      }
});

export default memo(CartItemComponent)