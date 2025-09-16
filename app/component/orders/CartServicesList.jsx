import { View, StyleSheet, Dimensions } from 'react-native'
import React , {memo} from 'react'
import tw from 'twrnc'
import { FlashList } from '@shopify/flash-list'
import { RFPercentage } from 'react-native-responsive-fontsize'
import AnimatedLottieView from 'lottie-react-native'
import LoadingScreen from '../../screens/loading/LoadingScreen'
import ArrowBack from '../ArrowBack'
import { Colors } from '../../constant/styles'
import AppText from '../AppText'
import CartItem from '../../screens/CartScreen/CartItem'
const { height , width } = Dimensions.get('screen')

const CartServiceList = memo(({ services }) => {
    if (!services) {
      return (<View style={tw`py-[${height * 0.3}] h-[${height * 0.2}] bg-white`}>
        <LoadingScreen />
      </View>)
    }
    return (
  
      <View style={styles.listContainer}>
        <FlashList
          data={services}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={25}
          windowSize={10}
          keyExtractor={(item, index) => item.id.toString()}
          contentContainerStyle={styles.contentContainerStyle}
          estimatedItemSize={200}
          removeClippedSubviews={false}
          ListEmptyComponent={() => (
            <>
            <View style={tw` bg-white flex flex-row-reverse px-4`}>
  
              <ArrowBack style={{
                marginHorizontal: 1,
                backgroundColor: Colors.grayColor,
                borderRadius: 15,
                overflow: 'hidden',
                padding: 5,
                fontSize: RFPercentage(3),
                maxWidth: 60,
                display:'flex',
                paddingHorizontal: 15
              }} />
              </View>
              <View style={styles.noItemContainer}>
                <AnimatedLottieView
                  autoPlay
                  style={{
                    width: width * 0.3,
                    height: height * 0.3,
                  }}
                  source={require('../../assets/soon.json')} />
                <AppText text={"Soon"} style={{ color: Colors.primaryColor, fontSize: RFPercentage(4), marginTop: 15 }} />
              </View>
            </>
          )}
          ItemSeparatorComponent={
  
            () => (
              <View
                style={{
                  height: 10,
                  width: "100%",
                }}
              />
            )
          }
          renderItem={({ item }) => {
            return (
              <CartItem item={item} />
            );
          }}
        />
      </View>
    )
  }
  )

  export default CartServiceList
  const styles = StyleSheet.create({
    container: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      backgroundColor: Colors.whiteColor,
    },
    header: {
      textAlign: "center",
      display: 'flex', flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10
      // gap:18
    },
    name: {
      fontSize: RFPercentage(1.7),
      color: Colors.blackColor,
    },
    itemContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      height: "auto",
      width: width * 0.95,
      padding: 10,
      // borderWidth: 0.7,
      borderRadius: 10,
      marginHorizontal: 8,
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
    descriptionContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "auto",
      width: width * 0.9,
      padding: 10,
      // borderWidth: 0.7,
      borderRadius: 10,
      marginVertical: 10,
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
      fontSize: RFPercentage(2),
      color: Colors.primaryColor,
      marginTop: 5,
      fontWeight: 700,
    },
    title: {
      fontSize: RFPercentage(2.2),
      color: Colors.primaryColor,
    },
    itemContainer2: {
      display: "flex",
      flex: 2,
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    buttonsContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    increaseButtonContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 80,
      height: 40,
      paddingHorizontal: 10,
      marginHorizontal: 5,
      borderRadius: 5.0,
      marginTop: 4.0,
      borderRadius: 40,
      backgroundColor: Colors.primaryColor,
    },
    buttonText: {
      color: Colors.whiteColor,
    },
    noItemContainer: {
      maxHeight: height * 0.75,
      // marginTop: 10,
      paddingBottom: height * 0.3,
      display: 'flex',
      alignItems: 'center',
      paddingTop: height * 0.2,
      overflow: 'hidden',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 10,
      backgroundColor: Colors.bodyBackColor
    },
    listContainer: {
      display: "flex",
      flexDirection: "row",
      direction: "rtl",
      justifyContent: 'center',
      flexWrap: "wrap",
      backgroundColor: Colors.grayColor / 10,
      gap: 15,
      width: width,
      minHeight: height * 0.8,
    },
    headerStyle: {
      backgroundColor: Colors.whiteColor,
      color: Colors.primaryColor,
      marginTop: 10,
      padding: 5,
      paddingHorizontal: 10,
      overflow: 'hidden',
      borderRadius: 15,
    },
    contentContainerStyle: {
      paddingVertical: 10,
      paddingHorizontal: width * (1 - 0.995)
    }
  });