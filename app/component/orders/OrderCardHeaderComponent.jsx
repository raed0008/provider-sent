import {
    Dimensions,
    Image,
    StyleSheet,
    View,
  } from "react-native";
  import React, { memo } from "react";

  import { Colors } from "../../constant/styles";
  import AppText from "../../component/AppText";
import useNameInLanguage from "../../hooks/useNameInLanguage";
import { RFPercentage } from "react-native-responsive-fontsize";

  const { width, height } = Dimensions.get("screen");
  

const OrderCardHeaderComponent = ({item}) => {
    const {name:itemName} = useNameInLanguage()

  return (
    <View style={styles.headerContainer}>
          {item?.attributes?.services?.data?.length > 0 && (
            <>
              <Image
                height={22}
                width={22}
                source={{
                  uri: item?.attributes?.services?.data[0]?.attributes?.category
                    ?.data?.attributes?.image?.data[0]?.attributes?.url,
                }}
              />
              <AppText
                text={
                  item?.attributes?.services?.data[0]?.attributes?.category
                    ?.data?.attributes[itemName]
                }
                style={[
                  styles.header,
                  { color: Colors.primaryColor, fontSize:RFPercentage(1.9) },
                ]}
                centered={true}
              />
            </>
          )}
          {item?.attributes?.service_carts?.data?.length > 0 &&
            <>
              <AppText
                text={item?.attributes?.service_carts?.data[0]?.attributes?.service?.data?.attributes?.category?.data?.attributes[itemName]}
                style={[
                  styles.header,
                  { color: Colors.redColor, fontSize:RFPercentage(1.9), },
                ]}
                centered={true}
              />
            </>
          }
          {item?.attributes?.packages?.data?.length > 0 && (
            <AppText
              text={item?.attributes?.packages?.data[0]?.attributes[itemName]}
              style={[
                styles.header,
                { color: Colors.primaryColor, fontSize:RFPercentage(1.9) },
              ]}
              centered={true}
            />
          )}
        </View>
  )
}

export default memo(OrderCardHeaderComponent)

const styles = StyleSheet.create({
    scrollContainer: {
      height: "100%",
    },
    container: {
      height: "100%",
      backgroundColor: Colors.whiteColor,
      width: width,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerContainer: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      // backgroundColor:'red',
    //   paddingHorizontal: 11,
      paddingVertical: 4,
      gap: 10,
    },
    orderCardContainer: {
      paddingVertical: 10,
      width: width * 0.88,
      paddingHorizontal: 20,
      height: "auto",
      marginBottom: 10,
      flex: 1,
      gap: 5,
      backgroundColor: Colors.whiteColor,
      shadowColor: Colors.grayColor,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 1.41,
  
      elevation: 0.4,
      borderColor: Colors.grayColor,
      borderWidth: 1.4,
      borderRadius: 8,
    },
    name: {
      color: Colors.blackColor,
      fontSize:RFPercentage(1.9),
    },
    title: {
      color: Colors.blackColor,
      fontSize:RFPercentage(1.9),
    },
    price: {
      color: Colors.primaryColor,
      fontSize:RFPercentage(1.9),
    },
    status: {
      color: Colors.primaryColor,
      fontSize:RFPercentage(1.9),
    },
    date: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      justifyContent: "flex-start",
      flexDirection: "row",
    },
    chatContainer: {
      paddingHorizontal: 15,
      backgroundColor: Colors.primaryColor,
      width: width * 0.131,
      height: height * 0.04,
      borderRadius: 20,
      // marginHorizontal:width*0.65,
      left: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    IconContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 10
    }
  });