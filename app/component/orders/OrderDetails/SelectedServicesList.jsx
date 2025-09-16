import { View, StyleSheet, FlatList, Dimensions } from 'react-native'
import React, { memo } from 'react'
import { useLanguageContext } from '../../../context/LanguageContext'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { Colors } from '../../../constant/styles'
import AppText from '../../AppText'
import PriceTextComponent from '../../PriceTextComponent'
const { width } = Dimensions.get('screen')
function SelectedServicesList({ currentSelectedServices, type = '' }) {
  const { language } = useLanguageContext()
  const name = `name_${language}`
  if (currentSelectedServices?.length === 0) return null
  return (
    <View style={styles.itemContainer}>
      <FlatList
        data={currentSelectedServices}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}

        keyExtractor={(item, index) => item.id}
        style={{
          display: "flex",
          flexDirection: language === 'ar' ? 'row' : 'row',
          flexWrap: "wrap",
          marginTop: 15,
          gap: 15,
          width: width,
        }}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 15,
              }}
            >
              <AppText
                centered={true}
                text={item?.attributes[name]}
                style={[
                  styles.name,
                  { fontSize: RFPercentage(1.9), paddingRight: 10, maxWidth: '65%' },
                ]}
              />

              <PriceTextComponent
                type='header'
                containerStyleTw={`bg-[${Colors.primaryColor}] px-4 rounded-full`}
                style={{
                  backgroundColor: Colors.primaryColor,
                  fontSize: RFPercentage(1.5),
                  paddingVertical: 4,
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  overflow: "hidden",
                  color: Colors.whiteColor,
                }}
                price={type === 'package' ? item?.attributes?.price : item?.attributes?.Price}
              />

            </View>
          );
        }}
      />
    </View>
  )

}
export default memo(SelectedServicesList)
const styles = StyleSheet.create({

  name: {
    fontSize: RFPercentage(1.8),
    color: Colors.blackColor,
    textAlign:'left'

  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
    width: width * 0.90,
    // maxWidth: width * 0.9,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    paddingVertical: 10,
    // borderWidth: 0.7,
    borderRadius: 10,
    // marginVertical: 10,
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

});
