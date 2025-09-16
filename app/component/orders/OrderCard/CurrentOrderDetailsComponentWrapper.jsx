import { Dimensions, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
import { memo } from "react";
import tw from "twrnc";

import useNameInLanguage from "../../../hooks/useNameInLanguage";
import AppText from "../../AppText";
import PriceTextComponent from "../../PriceTextComponent";
import { Colors } from "../../../constant/styles";
import { useLanguageContext } from "../../../context/LanguageContext";
import CurrentOrderOrderAction from "./CurrentOrderOrderAction";
import { convertDate } from "../DateOrderComponent";
import LocationTextComponent from "../LocationTextComponent";

const { width, height } = Dimensions.get("screen");

const CurrentOrderDetailsComponentWrapper = ({ item }) => {
  const { name: itemName, location } = useNameInLanguage();
  const { language, direction } = useLanguageContext();
  return (
    <View>
      <View>
        <AppText
          centered={true}
          text={item?.attributes?.service?.data?.attributes[itemName]}
          style={styles.name}
        />
      </View>
      <View style={styles.itemContainer}>
        <AppText centered={true} text={"Price"} style={styles.title} />
        <PriceTextComponent
          style={{
            color: Colors.blackColor,
            fontSize: RFPercentage(2),
            marginTop: 4,
          }}
          price={Math.round(item?.attributes?.totalPrice * 1.15)}
        />
      </View>
      <LocationTextComponent location={item?.attributes[location]} />
      <View style={styles.itemContainer}>
        <AppText centered={true} text={"Date"} style={styles.title} />
        <AppText
          text={convertDate(item?.attributes?.date, language)}
          centered={true}
          style={[
            styles.location,
            {
              writingDirection: direction,
              textAlign: "left",
            },
          ]}
        />
      </View>
      <View>
        {item?.attributes?.description && (
          <View style={styles.descriptionContainer}>
            <>
              <AppText centered={false} text={"Notes"} style={styles.title} />
              <AppText
                centered={false}
                text={
                  item?.attributes?.description
                    ? item?.attributes?.description
                    : "No Data"
                }
                style={[styles.description]}
              />
            </>
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(CurrentOrderDetailsComponentWrapper);

const styles = StyleSheet.create({
  scrollContainer: {
    height: "100%",
    backgroundColor: Colors.whiteColor,
  },
  container: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    // backgroundColor:'red'
  },
  name: {
    fontSize: RFPercentage(1.7),
    color: Colors.blackColor,
  },
  itemContainer: {
    display: "flex",
    height: "auto",
    flexDirection: "row",
    alignItems: "center",
    width: width * 0.9,
    padding: 10,
    // borderWidth: 0.7,
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
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  price: {
    fontSize: RFPercentage(1.83),
    color: Colors.blackColor,
    marginTop: 5,
    width: width * 1,
    // backgroundColor:'red'
  },
  location: {
    fontSize: RFPercentage(1.7),
    color: Colors.blackColor,
    marginTop: 5,
    paddingHorizontal: 10,
    minWidth: width * 0.86,
    // backgroundColor:'red'
  },
  title: {
    fontSize: RFPercentage(2.3),
    color: Colors.primaryColor,
    // textAlign:'left'
  },
  chatContainer: {
    paddingHorizontal: 19,
    backgroundColor: Colors.primaryColor,
    width: 60,
    height: 40,
    borderRadius: 20,
    marginHorizontal: width * 0.8,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    fontSize: RFPercentage(1.8),
    color: Colors.blackColor,
    marginTop: 5,
    paddingHorizontal: 10,
    minWidth: width * 0.85,
    // backgroundColor:'red'
  },
  CartServiceStylesContainer: {
    display: "flex",
    flexDirection: "row",
    borderWidth: 0.5,

    padding: 5,
    borderRadius: 10,
    // height:100,
    // width:100,
    gap: 4,
    backgroundColor: Colors.piege,
    borderColor: Colors.whiteColor,
  },
});
