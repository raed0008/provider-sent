// import {
//     View,
//     Dimensions,
//     TouchableOpacity,
//     Platform,
// } from "react-native";
// import React, { memo, useCallback, useEffect, useState } from "react";
// import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
// import { StyleSheet } from "react-native";
// import { Colors } from "../../constant/styles";
// import AppText from "../../component/AppText";
// import AppButton from "../../component/AppButton";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     addServiceToCart,
//     updateServiceQuantity,
// } from "../../store/features/CartServiceSlice";
// import { CURRENCY } from "../../navigation/routes";
// import { useTranslation } from "react-i18next";
// import useLanguage from "../../../utils/language";
// import tw from 'twrnc'
// import { useLanguageContext } from "../../context/LanguageContext";
// const { width, height } = Dimensions.get("screen");
//  function CartItem({ item }) {
//     const dispatch = useDispatch()
//     const cartServicesItem = useSelector((state) => state?.cartService?.services)
//     const IsSelected = cartServicesItem?.filter((service)=>service?.id === item?.id);
//     const {language} = useLanguageContext()
//     const name = `name_${language}`

//     return (
//         <View style={[styles.itemContainer,tw` flex ${ language === 'ar'?' flex-row':' flex-row'}`]}>
//                <ItemInfoComponent price={item?.attributes?.Price} name={item?.attributes[name]}/> 
//             <QuantiyControlButton item={item} 
//             IsSelected={IsSelected}
//             />

//         </View>
//     )
// }
// export default memo(CartItem)

// const ItemInfoComponent = memo(({name,price})=>{
//     const { t} = useTranslation()
//     const isPriceZero = price === "0";
//     const { language } = useLanguageContext()
//     console.log("item info ",name)
//     return (
//         <View style={[styles.itemContainer2]}>
//         <AppText
//             centered={true}
//             text={name}
//             style={[styles.name, { fontSize: RFPercentage(2), paddingRight: 10 }]}
//         />
// {
//     isPriceZero ?   <AppText
//     centered={true}
//     text={ "Price after visit" }
//     style={[styles.price, { fontSize: RFPercentage(2), paddingRight: 10 }]}
//     /> :
//         <View style={tw` gap-1  ${language==='ar'?
//             Platform.OS === 'ios'?`flex-row`:`flex-row-reverse`
//         :  Platform.OS === 'android'?`flex-row`:`flex-row-reverse`}`}>
//         <AppText
//             centered={true}
//             text={`${price} `}  
//             style={[styles.price, { fontSize: RFPercentage(2), }]}
//             />
//         <AppText
//             centered={true}
//             text={t(CURRENCY)}  
//             style={[styles.price, { fontSize: RFPercentage(2),}]}
//             />
//             </View>
//         }

//     </View>
//     )
// })
// const QuantiyControlButton = memo(({IsSelected,item})=>{
//     const dispatch = useDispatch()
//     const  { language } = useLanguageContext()
//     const  name = `name_${language}`
//     const cartServicesItem = useSelector((state) => state?.cartService?.services)
//     const handlePressAddButton = useCallback((id)=>{
//         console.log("ADDDing item ",item)
//         dispatch(addServiceToCart({ id, qty: 1 , price:item?.attributes?.Price,name_ar:item.attributes?.name_ar,name_en:item.attributes?.name_en}))
//     },[])

//     const handlePressUpdateQuantityButton = useCallback((id, newQuantity) => {
//         dispatch(updateServiceQuantity({ id, quantity: newQuantity }));
//     },[])
//     return (
//         <View style={styles.buttonsContainer}>
//                 {
//                     (IsSelected[0]?.qty > 0)? 
//                     <View style={styles.buttonsContainer2} >
//                         <TouchableOpacity style={styles.button1} onPress={()=>handlePressAddButton(item?.id)}>
//                             <AppText text={"+"} style={{    color:Colors.whiteColor,fontSize:RFPercentage(3.1)}}/>
//                         </TouchableOpacity>
                  
//                     <AppText text={IsSelected[0]?.qty} style={{color:Colors.whiteColor,fontSize:RFPercentage(2.4)}}/> 
                  
//                     <TouchableOpacity style={styles.button1}      
//                                    onPress={()=>handlePressUpdateQuantityButton(item?.id,IsSelected[0]?.qty-1)}
// >
//                             <AppText text={"-"} style={{    color:Colors.whiteColor,fontSize:RFPercentage(3.1)}}/>
//                         </TouchableOpacity>
//                     </View>  :     
//                 <AppButton title={"Add"} 
//                 textStyle={styles.buttonText} 
//                 onPress={()=>{
//                     handlePressAddButton(item?.id)
//                 }} />
//                     }
//             </View>
//     )
// })
// const styles = StyleSheet.create({
//     container: {
//         paddingVertical: 10,
//         paddingHorizontal: 18,
//         backgroundColor: Colors.whiteColor,
//     },
//     button1:{
//     width:width*0.098,
//     borderRadius:width*0.098*0.5,
//     backgroundColor:Colors.primaryColor,
//     },
//     header: {
//         textAlign: "left",
//     },
//     name: {
//         fontSize: RFPercentage(1.7),
//         color: Colors.blackColor,
//     },
//     itemContainer: {
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         height: "auto",
//         width: width * 0.95,
//         padding: 10,
//         // borderWidth: 0.7,
//         borderRadius: 10,
//         marginHorizontal: 8,
//         backgroundColor: Colors.whiteColor,
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 1,
//         },
//         shadowOpacity: 0.2,
//         shadowRadius: 1.41,
//         elevation: 4,
//         gap: 10,
//     },
//     descriptionContainer: {
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         height: "auto",
//         width: width * 0.9,
//         padding: 10,
//         // borderWidth: 0.7,
//         borderRadius: 10,
//         marginVertical: 10,
//         backgroundColor: Colors.whiteColor,
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 1,
//         },
//         shadowOpacity: 0.2,
//         shadowRadius: 1.41,
//         elevation: 4,
//         gap: 10,
//     },
//     price: {
//         fontSize: RFPercentage(2),
//         color: Colors.primaryColor,
//         marginTop: 5,
//         fontWeight: 700,
//     },
//     title: {
//         fontSize: RFPercentage(2.2),
//         color: Colors.primaryColor,
//     },
//     itemContainer2: {
//         display: "flex",
//         flex: 2,
//         alignItems: "flex-start",
//         paddingVertical: 10,
//         paddingHorizontal: 10,
//     },
//     buttonsContainer: {
//         flex: 1,
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "center",
        
//         // backgroundColor:'red'
//     },
//     buttonsContainer2: {
//         flex: 1,
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor:Colors.primaryColor,
//         // height:height*0.07,
//         height:height*0.05,
//         gap:7,
//         width:width*0.3,
//         // paddingHorizontal:height*0.1,
//         borderRadius:width*0.9,
//         // backgroundColor:'red'
//     },
//     increaseButtonContainer: {
//         alignItems: "center",
//         justifyContent: "center",
//         width: 80,
//         height: 40,
//         paddingHorizontal: 10,
//         marginHorizontal: 5,
//         borderRadius: 5.0,
//         marginTop: 4.0,
//         borderRadius: 40,
//         backgroundColor: Colors.primaryColor,
//     },
//     buttonText: {
//         color: Colors.whiteColor,
//         fontSize: RFPercentage(1.7)
//     },
//     noItemContainer: {
//         height: height * 1,
//         marginTop: 10,
//         paddingBottom: height * 0.3,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: Colors.whiteColor
//     }
// });
