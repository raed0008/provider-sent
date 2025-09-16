import { View, Text } from 'react-native'
import React from 'react'
import { FlatList, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Colors } from '../../constant/styles';
import CartItemComponent from './CartItemComponent';
const { width, height } = Dimensions.get('screen')
const CartListItemDetails = ({item}) => {

    if(item?.attributes?.service_carts?.data?.length == 0) return
  return (
    <View style={styles.itemContainer}>
    <FlatList
      data={item?.attributes?.service_carts?.data}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}

      keyExtractor={(item, index) => item.id}
      style={styles.listStyles}
      renderItem={({ item }) => {
        return (
        <CartItemComponent item={item} />
        );
      }}
    />
  </View>
  )
}

export default CartListItemDetails
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
      }, CartServiceStylesContainer: {
        display: 'flex',
        flexDirection: 'row',
        borderWidth: 0.5,
        padding: 5,
        borderRadius: 10,
        gap:5,
        // height:100,
        // width:100,        gap: 4,
        backgroundColor: Colors.piege,
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
        flexWrap: 'wrap',
        maxWidth: width * 0.9,
        // backgroundColor:"blue",
        
        gap: 15,
      },priceTextStyles:{
        backgroundColor: Colors.primaryColor,
        fontSize: RFPercentage(1.5),
        padding: 6,   
         borderRadius: 10,
         overflow:"hidden",
        color: Colors.whiteColor,
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
        fontSize: RFPercentage(1.5),
        padding: 6,
        borderRadius: 10,
        overflow:"hidden",

         paddingHorizontal: 15,
        color: Colors.whiteColor,
      }
});