import React from "react";
import { Alert, Dimensions, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors, Sizes, Fonts, mainFont } from "../../constant/styles";
import Dialog from "react-native-dialog";
import AppText from "../AppText";
import AppButton from "../AppButton";
import * as Linking from 'expo-linking'
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { t } from "i18next";
import { RFPercentage } from "react-native-responsive-fontsize";
const { width } = Dimensions.get("screen");

export default function ContactUsModal({ visible, hideModal }) {
  const dialogBackgroundColor = Colors.whiteColor;
  const handleWhatsAppPress = () => {
    
    try {

      let phoneNumber = "+9660592799173"; // Replace with your phone number
      let message = "السلام عليكم"; // Replace with your message
      let encodedMessage = encodeURIComponent(message);
      let url = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
      // Open WhatsApp
      Linking.openURL(url).then(() => {
        console.log('WhatsApp opened successfully');
      }).catch((err) => {
        Alert.alert(t("Unable to open whatsapp Please contact us on +9660592799173"), "", [
          {
            text: t('Ok')

          }])
        // You can show an alert here to inform the user that WhatsApp is not installed
      });
      console.log("url", url)
    } catch (error) {
      console.log("error ", error)
    }
  };

  const handlePhoneCallPress = () => {
    let phoneNumber = "111"; // Replace with your phone number
    let url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const handleEmailPress = () => {
    let emailAddress = "cs@njik.sa"; // Replace with your email address
    let subject = "Hello"; // Replace with your subject
    let body = "Hello,!"; // Replace with your body
    let encodedSubject = encodeURIComponent(subject);
    let encodedBody = encodeURIComponent(body);
    let url = `mailto:${emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;
    Linking.openURL(url).then(() => {
      console.log("open email success")
    }).catch(err => {
      Alert.alert(t("Unable to open Email Please contact us on cs@njik.sa"), "", [{ text: t('Ok') }])
    })
  };


  return (
    <Dialog.Container
      visible={visible}
      transparent={true}
      backdropOpacity={0.1}
      blurStyle={{ backgroundColor: dialogBackgroundColor }}
      backdropStyle={{ backgroundColor: dialogBackgroundColor }}
      contentStyle={[styles.dialogContainerStyle, { backgroundColor: dialogBackgroundColor }]}
      onBackdropPress={hideModal}
    >
      <View style={{ backgroundColor: dialogBackgroundColor, alignItems: "center", paddingVertical: 25 }}>

        {/* العنوان */}
        <AppText
          text={`Contact Us`}
          style={{
            color: Colors.blackColor,
            fontSize: RFPercentage(2.5),
            fontWeight: 'bold',
            marginBottom: 25,
          }}
        />

        {/* زر واتساب */}
        <TouchableOpacity
          onPress={handleWhatsAppPress}
          style={styles.button}
        >
          <AppText
            text={`Whatsapp`}
            style={styles.buttonText}
          />
          <FontAwesome
            name="whatsapp"
            size={22}
            color={Colors.primaryColor}
            style={styles.iconRight}
          />
        </TouchableOpacity>

        {/* زر الإيميل */}
        <TouchableOpacity
          onPress={handleEmailPress}
          style={styles.button}
        >
          <AppText
            text={"Email"}
            style={styles.buttonText}
          />
          <Ionicons
            name="mail-outline"
            size={22}
            color={Colors.primaryColor}
            style={styles.iconRight}
          />
        </TouchableOpacity>


      </View>
    </Dialog.Container>
  );
}
const styles = StyleSheet.create({
  dialogContainerStyle: {
    borderRadius: Sizes.fixPadding,
    width: width - 80,
  },
    iconRight: {
    position: 'absolute',
    left: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primaryColor,
    borderRadius: 50,
    paddingVertical: 12,
    width: width * 0.7,
    marginBottom: 15,
  },
  buttonText: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(2.2),
    fontWeight: '500',
  },
});
