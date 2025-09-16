import { View, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import AppText from '../../AppText'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { useTranslation } from 'react-i18next'
import { CURRENCY } from '../../../navigation/routes'
import { Colors } from '../../../constant/styles'
import tw from  'twrnc'
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'react-native'

const {width } = Dimensions.get('screen')
const RenderAdditionalPriceList = ({additionalAmounts,setAdditionalAmounts}) => {
    const handleDeletePrice =(item) => {
      const newArr = additionalAmounts.filter((amount)=>amount !== item)
      setAdditionalAmounts(newArr)
    }
    if(additionalAmounts?.length === 0 ) return ; 
  return (
    <View style={styles.AdditionalAmmountsContainer}>
        
    {additionalAmounts?.map((amount,index) => (
      <PriceCard key={index} amount={amount} handleDeletePrice={handleDeletePrice}/>
    ))}
  </View>
  )
}

export default RenderAdditionalPriceList


const PriceCard = ({amount,handleDeletePrice})=>{
  const {t}  =  useTranslation()

  return (
    <View key={amount.partName || amount.description} style={[styles.container3,tw`border-[1px] border-gray-200 `]}>
        <View style={styles?.additionalAmountContainer}>
          <View style={styles?.additionalAmountContainer2}>

          <AppText
            text={"اسم القطعة"}
            style={styles.price}
            centered={true}
          />
          <AppText
            text={amount.partName || amount.description}
            centered={true}
            style={{ color: Colors.blackColor }}
          />
        </View>
        </View>
        <View style={styles?.additionalAmountContainer}>
          <AppText
            text={"السعر"}
            style={styles.price}
            centered={true}
          />

          <AppText
            text={`${amount.partPrice || amount.amount} ${t(CURRENCY)}`}
            style={{
              color: Colors.blackColor,
              maxWidth: width * 0.5,
              fontSize: 13,
              marginTop: 5,
            }}
            centered={true}
          />
        </View>
        <View style={{}}>
          {
            (amount?.spareImage || amount?.billImage) &&

            <Image source={{uri: amount?.spareImage || amount?.billImage}} style={{height:150, width :150,borderRadius:20,alignSelf:'center'}}/>
          }
        </View>
        <TouchableOpacity style={styles.FloatDelete} onPress={()=>handleDeletePrice(amount)}>
        <AntDesign name="delete" size={24} color={Colors.whiteColor} />
        </TouchableOpacity>
      </View>
  )
}
const styles = StyleSheet.create({
    AdditionalAmmountsContainer: {
        width:width*0.97,
        alignSelf:'center',
        gap:15,

       padding:20,
      },
    container: {
        padding: 16,
        width: width,
    },
    dropdown: {
        height: 50,
        borderColor: "gray",
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5,
        marginTop: 5,
        marginHorizontal: 5,
    },
    placeholderStyle: {
        fontSize: RFPercentage(1.8),
    },
    selectedTextStyle: {
        fontSize: RFPercentage(2),
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: RFPercentage(2),
    },
    additionalAmountContainer: {
        display: "flex",
        paddingHorizontal: 10,
        flexDirection: "column",
        gap: 15,
        // alignItems: "center",
        
      },
    additionalAmountContainer2: {
        display: "flex",
        // paddingHorizontal: 10,
        flexDirection: "row",
        gap: 15,
        alignItems: "start",
        
      },
      price: {
        fontSize: 17,
        color: Colors.primaryColor,
        marginTop: 5,
        fontWeight: 700,
      }, container3: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
        // borderWidth: 3,
        paddingVertical: 10,

        // borderColor:Colors.grayColor,
        // width: width * 0.9,
        borderRadius: 10,
        paddingHorizontal: 5,
      },
      shadowStyles :{
        shadowColor: "#000",
        borderWidth:0.001,
        borderColor:Colors.grayColor,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.15,
          shadowRadius: 0.41,
          elevation: 1,
      
      },
      FloatDelete:{
        top:10,
        right:10,
        padding:10,
        backgroundColor:Colors.redColor,
        borderRadius:50,
        position:'absolute'
      }
});