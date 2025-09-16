// import { resizeAndCompressImage, uploadAudioToFirebase, uploadToFirebase } from "../../utils/firebase/helpers";
import { collection, addDoc, doc, getDoc, } from 'firebase/firestore';

import { GiftedChat } from 'react-native-gifted-chat';
import { db } from '../../../firebaseConfig';
import { resizeAndCompressImage, uploadAudioToFirebase, uploadToFirebase  } from '../../utils/firebase/helper';
import { getUserByPhoneNumber } from '../../../utils/user';
import api from '../../../utils';

const MAX_RETRIES = 5;

export const uploadImage = async (images, values, ImageName, retryCount = 0,setProgressValue) => {
    try {
        const imageUrls = [];
        console.log('the images are image caht firebas', images)
        for (const imageUri of images) {
            const resizedUri = await resizeAndCompressImage(imageUri);

            const response = await uploadToFirebase(resizedUri, 'image' + new Date().getTime(), (progress) => {
              
                console.log('the prograss',progress)
                setProgressValue(progress.toFixed())
  
              
            })
            if (response) {
                console.log('the uploading responsed', response)
                imageUrls.push(response?.downloadUrl)
            }
        }
        console.log('the images url is ', imageUrls)
if(imageUrls?.length >0){

  return imageUrls;
}

    }
    catch (error) {
        console.error("Error uploading image:", error);
        if (retryCount < MAX_RETRIES - 1) {
            return uploadImage(images, values, ImageName, retryCount + 1,setProgressValue);
        } else {
            console.error("Upload failed after maximum retries.");
        }
    }


};
export const handleImageSelected = async (imageUri,userId,setIsUploading,user,setMessages,sendPushNotification,currentChannelName,CurrentChatRoom,setProgressValue,item) => {
    setIsUploading(true); // Set isUploading to true when the upload starts
console.log('the image url is ',imageUri)
    try {
      // Upload the image and get the download URL
      const downloadURL = await uploadImage([imageUri], {}, 'image',5,setProgressValue);
      console.log('the image selecte is ',downloadURL)
      // console.log("the download image uri ",downloadURL)
      // Create a new message object with the image URL
      const newMessage = {
        _id: Math.random().toString(), // Generate a unique ID
        text: null, // No text for image messages
        createdAt: new Date(), // Current date and time
        image: downloadURL[0],
        user: {
          _id: userId, // The ID of the current user
        },
      };

      // Append the new message to the messages array
      setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessage));

      // Save the new message to Firestore
      await addMessageToFirestore(newMessage,sendPushNotification,currentChannelName,CurrentChatRoom,user,item);
    } catch (error) {
      console.error('Error uploading image: handle image selec', error);
    } finally {
      setIsUploading(false); // Set isUploading to false when the upload is complete
    }
};

export  const  onSend = async (newMessagesArray = [],user,userId,setMessages,setText,sendPushNotification,currentChannelName,CurrentChatRoom,item) => {
    // Handle image messages
console.log("the data derer",{userId,setMessages,setText,sendPushNotification,currentChannelName,CurrentChatRoom})
    try {
      const newMessages = [{
        _id: Math.random()?.toString(), // Generate a unique ID
        text: newMessagesArray?.text, // No text for image messages
        createdAt: new Date(), // Current date and time
        user: {
          _id: userId, // The ID of the current user
        },
        loading: true, // Indicator for loading state
      }];

      // Update the state with the temporary message
      setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));

      const imageMessages = newMessages.filter((message) => message.image);
      console.log('the new message filtration',newMessages)
      if (imageMessages.length > 0) {
        setText('');
        // Upload images to storage and update message with download URL
        const promises = imageMessages.map(async (message) => {
          const response = await uploadImage(message.image);
          return {
            ...message,
            image: response.downloadURL,
            loading: false, // Set loading to false after successful upload
            user: {
              _id: userId, // Add the user ID here
            },
          };
        });
        const uploadedMessages = await Promise.all(promises);
        setMessages((prevMessages) => GiftedChat.append(prevMessages, uploadedMessages));

        uploadedMessages.forEach(async (message) => {
          await addMessageToFirestore(message,sendPushNotification,currentChannelName,
            CurrentChatRoom,user,item);
        });

        // Update the state with the actual image message

      } else {
        setText('');
        console.log("new message are ", newMessages);

        // Send text messages only
        const newMessage = {
          _id: Math.random().toString(), // Generate a unique ID
          text: newMessages[0]?.text, // No text for image messages
          createdAt: new Date(), // Current date and time
          user: {
            _id: userId, // The ID of the current user
          },
        };

        // Update the state with the actual text message

        // Save the new message to Firestore
        await addMessageToFirestore(newMessage,sendPushNotification,currentChannelName,CurrentChatRoom,user,item);

      }
    } catch (err) {
      console.log("error here" ,err);
    } finally {
      setText('');
    }
  };
 

  const addMessageToFirestore = async (message,sendPushNotification,currentChannelName,CurrentChatRoom,user,item) => {
    const messagesCollection = collection(db, `chatRooms/${CurrentChatRoom[0]?._id}/messages`);
    await addDoc(messagesCollection, {
      ...message,
      createdAt: new Date(),
    });
    const messageType = message?.text ? `${message?.text}` : message?.image ? 'صورة' : message?.audio ?'رسالة صوتية' :''

    try {
      const CurrentUserId =  ExtractUserID(currentChannelName) 
      const providerPresenceRef = doc(db, `chatRooms/${CurrentChatRoom[0]?._id}/users/${CurrentUserId}`);
      const userDoc = await getDoc(providerPresenceRef);
      if (userDoc.exists()) {
        const userToken = item?.attributes?.user?.data?.attributes?.expoPushNotificationToken
        const provider =  item?.attributes?.provider?.data
        let userId = item?.attributes?.user?.data?.id
        if(userId){
          console.log('tje user oektn is ',userToken)
          sendPushNotification(userToken,`لديك رسالة جديدة من ${provider?.attributes?.name} 📩`,messageType,'user',userId,false)

        }else {
          console.log("Provider document does not exist.",CurrentUserId);
        await  sendNotificationFortheUser(currentChannelName,sendPushNotification,messageType,item)
        }
      } else {
         console.log("Provider document does not exist.");
         await  sendNotificationFortheUser(currentChannelName,sendPushNotification,messageType,item)

      }
     } catch (error) {
      console.error("Error getting provider document:", error);
     }
  };


const uploadAudio = async (audioUri, retryCount = 0,setIsUploading) => {
    try {
        const audioUrls = [];

        // Optionally resize or process audio here if needed
        const processedAudioUri = await processAudio(audioUri);

        const response = await uploadAudioToFirebase(processedAudioUri, 'audio' + new Date().getTime(), (progress) => {
          setIsUploading( progress === 100 ? false : true)
        });
        
        if (response) {
            audioUrls.push(response?.downloadUrl);
        }

        if (audioUrls.length > 0) {
            return audioUrls[0];
        }
    } catch (error) {
        console.error("Error uploading audio:", error);
        if (retryCount < MAX_RETRIES - 1) {
            return uploadAudio(audioUri, retryCount + 1,setIsUploading);
        } else {
            console.error("Upload failed after maximum retries.");
        }
    }
};
export  const sendAudioMessage = async (audioUri,setMessages,userId,sendPushNotification,currentChannelName,CurrentChatRoom,user,item,setIsUploading) => {
  try {

    if (!audioUri) {
      alert('No audio recorded.');
      return;
    }
    
    // Upload the audio file and get the download URL
    const audioUrl = await uploadAudio(audioUri,4,setIsUploading);
    
    // Create a new message object with the audio URL
  const newMessage = {
    _id: Math.random().toString(), // Generate a unique ID
    text:null, // No text for audio messages
    createdAt: new Date(), // Current date and time
    audio: audioUrl,
    user: {
      _id: userId, // The ID of the current user
    },
  };
  
  
  // Append the new message to the messages array
  setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessage));
  console.log('sending audion  new message',newMessage)
  // Save the new message to Firestore
  await addMessageToFirestore(newMessage,sendPushNotification,currentChannelName,CurrentChatRoom,user,item);
}catch(err){
  console.log('errr send audion message',err)
}
};

const processAudio = async (audioUri) => {
    // Implement any audio processing needed here
    // For now, just return the original URI
    return audioUri;
};

// Example usage
const audioUri = 'path/to/your/audio/file.mp3';
uploadAudio(audioUri).then(audioUrl => {
    console.log('Uploaded audio URL:', audioUrl);
    return audioUrl
}).catch(error => {
    console.error('Failed to upload audio:', error);
});


  ///
 export  const ExtractUserID = (currentChannelName)=>{
    const userIdMatch = currentChannelName.match(/user_(\d+)/);
    
    if (userIdMatch && userIdMatch[1]) {
     const userId = userIdMatch[1]; // This will be the string "83"
    return userId
    } else {
     console.log("User ID not found");
    }
  }
 export  const ExractProviderId = (chatRoom)=>{
    const providerIdMatch = chatRoom.match(/provider_(\d+)/);
    
    if (providerIdMatch && providerIdMatch[1]) {
     const providerId = providerIdMatch[1]; // This will be the string "43"
     return providerId
    } else {
     console.log("Provider ID not found");
    }
    
    }

    export const sendNotificationFortheUser = async(currentChannelName,sendPushNotification,messageType,item)=>{
      try {
        const CurrentUserId =  ExtractUserID(currentChannelName) 
        const user = item?.attributes?.user?.data?.attributes
        const provider = item?.attributes?.provider?.data?.attributes
        const userToken = user?.expoPushNotificationToken
        console.log('the user is found ',user?.expoPushNotificationToken,user?.username)
        if(user?.username){

          sendPushNotification(userToken,`لديك رسالة جديدة من ${provider?.name} 📩`,messageType,'user',item?.attributes?.user?.data?.id,false)
        }else {
          
          console.log('the user is not found ',CurrentUserId)
        }

      } catch (error) {
        console.log('error sendding notification for the user',error)
      }
    }