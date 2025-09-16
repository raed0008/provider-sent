import { View, Text, KeyboardAvoidingView } from 'react-native'
import React from 'react'
import { GiftedChat, Send, Actions } from 'react-native-gifted-chat';
import { Dimensions } from 'react-native';
import { onSend } from '../../screens/firebaseChat/helpers';
import { Colors } from '../../constant/styles';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageContext } from '../../context/LanguageContext';
import { StyleSheet } from 'react-native';

const { height, width } = Dimensions.get('screen')
export default function CustomSendComponent(props) {
    const { language } = useLanguageContext()
    const {
        user, userId, setMessages, setText, sendPushNotification, currentChannelName, 
        CurrentChatRoom, text,item
    } = props

    return (
        <KeyboardAvoidingView>

        <Send
            {...props}
            style={{ marginBottom:RFPercentage(2) }}
            onSend={(messages) => onSend(messages, user, userId, setMessages, setText, sendPushNotification, currentChannelName, CurrentChatRoom,item)}
            text={text}
            >
            <View style={styles.Container}>

                <Ionicons name="send" size={RFPercentage(2.4)} color="white" style={[language === 'ar' ? styles.iconRoated : styles.iconNomal]} />
            </View>

        </Send>
            </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    Container: {
        // marginBottom:- RFPercentage(1.3), 
        paddingLeft: 4,
        backgroundColor: Colors.primaryColor, 
        padding: 1,
        borderRadius: width * 0.5 * 0.5, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
         height:RFPercentage(5), 
         width: RFPercentage(5),
        marginLeft:10
    },
    iconRoated: {
        transform: [{ rotate: '180deg' }],
    },
    iconNomal: {
        transform: [{ rotate: '0deg' }],
    }
})