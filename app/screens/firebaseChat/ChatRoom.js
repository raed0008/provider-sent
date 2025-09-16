import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { GiftedChat } from 'react-native-gifted-chat';
import { Colors } from '../../constant/styles';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { AntDesign } from '@expo/vector-icons';
import { ActivityIndicator, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc'
import LoadingScreen from '../loading/LoadingScreen';
import useNotifications from '../../../utils/notifications';
import ArrowBack from '../../component/ArrowBack';

import { ExtractUserID,ExractProviderId, onSend, sendAudioMessage } from './helpers';
import { CustomMessageText } from '../../component/chat/CustomMessageText';
import { CustomInputToolbar } from '../../component/chat/CustomInputToolbar';
import { CustomVoiceMessage } from '../../component/chat/CustomVoiceMessage';
import CustomSendComponent from '../../component/chat/CustomSendComponent';
import CustomChatActions from '../../component/chat/CustomChatActions';
import RenderVoiceActions from '../../component/chat/RenderVoiceActions';
import AppText from '../../component/AppText';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { height, width } = Dimensions.get('screen');

const ChatRoom = ({ route }) => {
  const currentChannelName = useSelector((state) => state?.orders?.currentChatChannel);
  const [lastSeen, setLastSeen] = useState(null);
  const [CurrentChatRoom, SetCurrentChatRoom] = useState(null);
  const [progressValue, setProgressValue] = useState(1);
  const [messages, setMessages] = useState(null);
  const user = useSelector((state) => state?.user?.userData);
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [recording, setCurrentISRecording] = useState(false);
  const { sendPushNotification, token } = useNotifications();
  const userId = user?.id;

  useEffect(() => {
    const fetchLastSeen = async () => {
      const storedLastSeen = await AsyncStorage.getItem(`${currentChannelName}_lastSeen`);
      if (storedLastSeen) {
        setLastSeen(new Date(storedLastSeen));
      } else {
        if (CurrentChatRoom && userId) {
          const lastSeenRef = doc(db, `chatRooms/${CurrentChatRoom[0]?._id}/users/${userId}`);
          const docSnapshot = await getDoc(lastSeenRef);
          if (docSnapshot.exists()) {
            setLastSeen(docSnapshot.data().lastSeen.toDate());
          } else {
            setLastSeen(null);
          }
        }
      }
    };

    fetchLastSeen();
  }, [CurrentChatRoom, userId, currentChannelName]);

  const updateLastSeen = async () => {
    if (CurrentChatRoom && userId) {
      const presenceRef = doc(db, `chatRooms/${CurrentChatRoom[0]?._id}/users/${userId}`);
      const currentTime = new Date();
      await setDoc(presenceRef, { lastSeen: currentTime }, { merge: true });
      await AsyncStorage.setItem(`${currentChannelName}_lastSeen`, currentTime.toISOString());
    }
  };

  useEffect(() => {
    if (CurrentChatRoom) {
      updateLastSeen();
      return () => {
        updateLastSeen();
      };
    }
  }, [CurrentChatRoom]);

  useEffect(() => {
    const ref = collection(db, 'chatRooms');

    const unsubscribe = onSnapshot(ref, (chatRooms) => {
      const data = chatRooms?.docs?.map((doc) => {
        return {
          ...doc.data(),
          _id: doc.id, // Add a unique ID for GiftedChat
        };
      });

      // Check if the chat room exists
      const chatRoomExists = data?.some(room => room.name === currentChannelName);
      if (!chatRoomExists) {
        // If the chat room does not exist, create it
        addDoc(ref, {
          name: currentChannelName,
          createdAt: new Date(),
        }).catch((error) => {
          console.log("Error creating chat room:", error);
        });
      } else {
        const room = data?.filter((room) => room?.name === currentChannelName);
        SetCurrentChatRoom(room);
      }
    });

    return unsubscribe;
  }, [currentChannelName]);

  useEffect(() => {
    if (CurrentChatRoom?.length > 0) {
      const messagesCollection = collection(db, `chatRooms/${CurrentChatRoom[0]?._id}/messages`);
      const unsubscribe = onSnapshot(messagesCollection, (querySnapshot) => {
        const orderedMessages = querySnapshot.docs.sort((a, b) => {
          return a.data().createdAt > b.data().createdAt ? -1 : 1;
        }).map((doc) => ({
          ...doc.data(),
          _id: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setMessages(orderedMessages);
      });

      return unsubscribe;
    }
  }, [CurrentChatRoom]);

  useEffect(() => {
    if (CurrentChatRoom) {
      updateProviderPresence(CurrentChatRoom[0]?._id, userId || ExractProviderId(currentChannelName), true);
      return () => {
        updateProviderPresence(CurrentChatRoom[0]?._id, userId || ExractProviderId(currentChannelName), false);
      };
    }
  }, [CurrentChatRoom]);

  const updateProviderPresence = async (chatRoomId, userId, isPresent) => {
    const presenceRef = doc(db, `chatRooms/${chatRoomId}/users/${userId}`);
    await setDoc(presenceRef, { isPresent }, { merge: true });
  };

  const scrollToBottomComponent = () => {
    return <AntDesign name="down" size={20} color="#333" />;
  };

  const countUnreadMessages = () => {
    if (!lastSeen || !messages?.length) return 0;

    const unreadCount = messages.filter((msg) => msg.createdAt > lastSeen && msg.user._id !== userId).length;
    return unreadCount;
  };

  const unreadCount = countUnreadMessages();

  if (!currentChannelName || !messages || !CurrentChatRoom) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, display: 'flex', backgroundColor: 'white' }}>
      <ArrowBack style={{ backgroundColor: 'white' }} />
      {unreadCount > 0 && (
      <View style={tw`w-full flex items-center`}>

        <View style={tw`bg-[${Colors.primaryColor}] w-[${width*0.15}] p-2 rounded-full items-center gap-2 justify-center flex flex-row`}>
          <Text style={tw` text-white text-sm p-0`}>{unreadCount}</Text>
          <AppText text={'Unread Messages'} style={tw` text-white text-sm p-0 mt-2`}/>
        </View>
      </View>
      )} 
      {isUploading && (
        <View style={{ height: 100 }}>
          <ActivityIndicator color={Colors.primaryColor} />
        </View>
      )}
         <GiftedChat
        alwaysShowSend
        scrollToBottomComponent={scrollToBottomComponent}
        scrollToBottom
        messages={messages}
        onSend={(messages) => onSend(messages, user, userId, setMessages, setText, sendPushNotification, currentChannelName, CurrentChatRoom, route?.params?.item)}
        inverted
        user={{
          _id: userId || ExractProviderId(currentChannelName), // Use user ID from your authentication system
        }}  

        renderAvatar ={null}

        isLoadingEarlier={true}
        renderMessageAudio={(props) => <CustomVoiceMessage {...props} />}
        renderLoading={() => {
          if (isUploading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            );
          }
        }}
        
        keyboardShouldPersistTaps='never'
        // locale={i18next.language}
        
        
        messagesContainerStyle={{ backgroundColor: Colors.whiteColor, paddingBottom:RFPercentage(5) }}
        renderMessageText={(props) => <CustomMessageText {...props} />}
        renderChatFooter={(props) => {
          return (
            <CustomInputToolbar
              recording={recording}
              setText={setText} 
              textInputValue={text}
              {...props} 
              sendAudioMessage={sendAudioMessage}
              setIsUploading={setIsUploading}
              setCurrentISRecording={setCurrentISRecording}
              setProgressValue={setProgressValue}
              user={user}
              userId={userId}
              setMessages={setMessages}
              sendPushNotification={sendPushNotification}
              currentChannelName={currentChannelName}
              CurrentChatRoom={CurrentChatRoom}
              text={text}
              item={route?.params?.item}
        containerStyle={{ borderTopWidth: 0, borderTopColor: '#333' }}
            />
          );
        }}
        renderInputToolbar={(props)=>null}
      />
      <View>
      </View>
    </View>
  );
};

export default ChatRoom;
