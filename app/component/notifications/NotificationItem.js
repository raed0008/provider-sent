import React, { useEffect, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Card } from "react-native-paper";
import AppText from "../AppText";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../constant/styles";
import { Avatar } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { intlFormat } from 'date-fns';
import { RFPercentage } from "react-native-responsive-fontsize";

const { width } = Dimensions.get("screen");

const NotificationItem = ({ text, onDeleteNotfication, time: date, body }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formattedTime, setFormattedTime] = useState(intlFormat(new Date(date), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }));

  if (!text) return null;

  useEffect(() => {
    const timer = setInterval(() => {
      const newFormattedTime = intlFormat(new Date(date), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
      setFormattedTime(newFormattedTime);
    }, 60000); // Updates every minute

    return () => {
      clearInterval(timer);
    };
  }, [date]);

  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });
    if (!text) return null;
    return (
      <RectButton style={styles.leftAction} onPress={() => setIsOpen(false)}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }],
              paddingTop: 15,
              paddingLeft: 5,
            },
          ]}
        >
          <MaterialIcons
            name="delete"
            size={27}
            color={Colors.redColor}
            style={{
              marginHorizontal: Sizes.fixPadding * 2.0,
              marginVertical: Sizes.fixPadding * 2.0,
            }}
            onPress={onDeleteNotfication}
          />
        </Animated.Text>
      </RectButton>
    );
  };

  const handleSwipeLeft = () => {
    console.log("Swiped left");
    onDeleteNotfication();
  };

  const handleSwipeRight = () => {
    console.log("Swiped right");
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      onSwipeableLeftOpen={handleSwipeLeft}
      onSwipeableRightOpen={handleSwipeRight}
    >
      <View style={styles.card}>
        <AntDesign
          size={20}
          style={{ padding: 6, borderRadius: 10,overflow:'hidden' }}
          name="notification"
          color={Colors.whiteColor}
          backgroundColor={Colors.primaryColor}
        />
        <View style={styles.content}>
          <AppText
            text={text}
            centered={true}
            style={{ fontSize: RFPercentage(1.7), color: Colors.primaryColor }}
          />
          {body && (
            <AppText
              text={body}
              centered={true}
              style={{ fontSize: RFPercentage(1.7), color: Colors.blackColor ,width:width*0.72}}
            />
          )}
          <AppText text={formattedTime} style={styles.date} centered={true} />
        </View>
      </View>
    </Swipeable>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  card: {
    width:'95%',
    backgroundColor: "white",
    padding: 10,
    alignSelf:'center',
    marginTop:10,
    margin: 10,
    marginHorizontal:width*0.12,
    shadowColor: "#000",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf:'center',
    gap: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderRadius: 14,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  time: {
    width: "auto",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    gap: 10,
    borderRadius: 14,
  },
  date: {
    fontSize: 11,
  }
});
