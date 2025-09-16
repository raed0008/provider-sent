import { View, StyleSheet, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { InputToolbar } from 'react-native-gifted-chat';
import { CustomComposer } from './CustomComposer';
import { Colors } from '../../constant/styles';
import { Dimensions } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import CustomSendComponent from './CustomSendComponent';
import RenderVoiceActions from './RenderVoiceActions';
import CustomChatActions from './CustomChatActions';
import { notInitialized } from 'react-redux/es/utils/useSyncExternalStore';
const { height , width } = Dimensions.get('screen')
export const CustomInputToolbar = (props) => {
  const [customHeight,setCustomHeight ] = useState(height*0.1)
  const { user,
    userId,
    setMessages,
    setText,
    sendPushNotification,
    currentChannelName,
    CurrentChatRoom,
    text,
    recording,
    item,
    setIsUploading,
    setCurrentISRecording,
    setProgressValue,
    sendAudioMessage
  } = 
    props
  
    return (
<>

      <InputToolbar
        {...props}
        containerStyle={[styles.inputToolbarContainer,{
          height:customHeight,

        }]}
        // primaryStyle={styles.inputToolbarPrimary}
        renderActions={(props) => (
          text?.length === 0 &&
          <>
            <RenderVoiceActions
              onAudioRecorded={sendAudioMessage}
              setMessages={setMessages}
              
              setIsUploading={setIsUploading}
              userId={userId}
              sendPushNotification={sendPushNotification}
              currentChannelName={currentChannelName}
              CurrentChatRoom={CurrentChatRoom}
              user={user}
              item={item}
              {...props}
              setCurrentISRecording={setCurrentISRecording}
            />
            {!recording && <CustomChatActions
              user={user}
              userId={userId}
              setIsUploading={setIsUploading}
              setMessages={setMessages}
              setText={setText}
              sendPushNotification={sendPushNotification}
              currentChannelName={currentChannelName}
              CurrentChatRoom={CurrentChatRoom}
              setProgressValue={setProgressValue}
              item={item}
            />}
          </>
        )}        secondaryStyle={styles.inputToolbarSecondary}
        renderSend={(props) => {
          return (
            text?.length > 0 && !recording &&
            <CustomSendComponent
              user={user}
              userId={userId}
              setMessages={setMessages}
              setText={setText}
              sendPushNotification={sendPushNotification}
              currentChannelName={currentChannelName}
              CurrentChatRoom={CurrentChatRoom}
              text={text}
              item={item}
            />
          );
        }}
        // renderAccessory={(props)=><View style={{height:1000}}/>}
        renderComposer={(props) => <CustomComposer 
          
          setCustomHeight={setCustomHeight}
          {...props} text={props.text} setText = {props.setText}  />}
        />
           
</>
);
  };
  const styles = StyleSheet.create({
    inputToolbarContainer: {
        backgroundColor: Colors.whiteColor,
        paddingHorizontal:  10,
        paddingVertical:RFPercentage(2),
        borderWidth:0,
        // <paddingVer />:200
      },
      inputToolbarPrimary: {
        flex:  1,
      },
      inputToolbarSecondary: {
        flex:  0,
      },
  });