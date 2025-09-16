import { View, Dimensions, StyleSheet, Image } from 'react-native';
import React, { memo } from 'react';
import AppText from '../AppText';
import CustomSwitch from './CustomSwitch';
import { Colors } from '../../constant/styles';
import { RFPercentage } from 'react-native-responsive-fontsize';


const { width } = Dimensions.get('screen');

const SwitchStatusCard = () => {

  return (
    <View style={styles.cardContainer}>
      <View style={styles.swithContainer}>
        <AppText text={"Receive Orders"} style={styles.switchText} />
        <CustomSwitch  />
      </View>
      <View style={styles.ImageContainer}>
        <Image source={require("../../assets/images/worker.png")} resizeMode="contain" style={{ height: 120, width: width * 0.5, flex: 1.1 }} />
      </View>
    </View>
  );
};

export default memo(SwitchStatusCard);

const styles = StyleSheet.create({
  cardContainer: {
    height: 150,
    paddingHorizontal: 20,
    gap: 30,
    width: width * 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swithContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    backgroundColor: Colors.primaryColor,
    padding: 15,
    borderRadius: 15,
    width: width * 0.5,
  },
  switchText: {
    color: Colors.whiteColor,
    fontSize:RFPercentage(2)
  },
  ImageContainer: {
    backgroundColor: Colors.whiteColor,
  },
});