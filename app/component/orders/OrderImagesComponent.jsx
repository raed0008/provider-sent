import { View, StyleSheet } from 'react-native'
import React, { memo, useState, useRef } from 'react'
import { Colors } from '../../constant/styles'
import { Image } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import AppText from '../AppText'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { Dimensions } from 'react-native'
import { ImageWrapper, ImageViewer } from 'react-native-reanimated-viewer';

const { width, height } = Dimensions.get('screen')

const OrderImagesComponent = memo(({ orderImages }) => {
  const imageRef = useRef(null);

  if (orderImages?.length === 0) return null;

  return (
    <View style={styles.descriptionContainer}>
      <>
        <AppText centered={true} text={"Images"} style={styles.title} />
        <Carousel
          width={width}
          height={height * 0.25} // قم بتعديل الارتفاع حسب الحاجة
          data={orderImages || []}
          autoPlay={true}
          autoPlayInterval={10000}
          loop={true}
          scrollAnimationDuration={1000}
          style={{
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
          renderItem={({ item, index }) => {
            return (
              <View style={{
                width,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ImageWrapper
                  key={item}
                  viewerRef={imageRef}
                  index={index}
                  style={{ 
                    width: width * 0.8, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  source={{
                    uri: item,
                  }}
                >
                  <Image
                    source={{
                      uri: item,
                    }}
                    style={{
                      height: height * 0.2,
                      width: width * 0.6,
                      resizeMode: "cover", // استبدال objectFit
                      borderRadius: 10,
                    }}
                  />
                </ImageWrapper>
              </View>
            );
          }}
        />
        <View style={{ flex: 1 }}>
          <ImageViewer
            ref={imageRef}
            // shouldCloseViewer={true}
            data={orderImages.map((el) => ({ key: `key-${el}`, source: { uri: el } }))}
          />
        </View>
      </>
    </View>
  )
})

export default OrderImagesComponent

const styles = StyleSheet.create({
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
  title: {
    fontSize: RFPercentage(2.3),
    color: Colors.primaryColor,
  },
});