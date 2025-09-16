import { useState, useRef, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import { Dimensions, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '../../constant/styles';
import AppText from '../AppText';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useLanguageContext } from '../../context/LanguageContext';

const { width } = Dimensions.get('screen');

const RenderVoiceActions = (props) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const waveRef = useRef();
  const { language } = useLanguageContext();
  const { sendPushNotification, currentChannelName, CurrentChatRoom, user, item } = props;
  const userData = useSelector((state) => state?.user?.userData);

  async function startRecording() {
    try {
      console.log("start recording voice");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.log('Permission to access microphone was denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (recording && !recording._isDoneRecording) {
        console.log('An existing recording is still active. Stopping it first.');
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      const { recording: newRecording , status } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.log("error starting recording ", err);
    }
  }
  
  async function stopRecording() {
    try {
      props.setIsUploading(true);
      if (recording && !recording._isDoneRecording) {
        await recording.stopAndUnloadAsync();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording?.getURI();
      // console.log('Recording stopped and stored at', uri);

      props.onAudioRecorded(uri, props.setMessages, props.userId, sendPushNotification, currentChannelName, CurrentChatRoom, userData, item,props.setIsUploading);
      setRecording(null);
      setIsRecording(false);
      setDuration(0);
    } catch (error) {
      console.log("error stopping recording ", error);
    } finally {
      props.setIsUploading(false);
    }
  }

  async function deleteRecording() {
    try {
      if (recording && !recording._isDoneRecording) {
        await recording.stopAndUnloadAsync();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      setRecording(null);
      setIsRecording(false);
      setDuration(0);
    } catch (err) {
      console.log('error deleting the record is ', err);
    }
  }
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <TouchableOpacity
      onPress={startRecording}
      disabled={isRecording}
    >
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <MaterialIcons name="delete-outline" size={24} style={styles.deleteIcon} color={Colors.redColor} onPress={deleteRecording} />
          <AppText style={styles.recordingText} text={
            language === 'ar' ? `يتم التسجيل ${duration} ث ... ` : `Recording ${duration} sec...`
          } />
          <Ionicons name="send" size={RFPercentage(2.4)} color={Colors.success} style={language === 'ar' ? styles.iconRoated : styles.iconNomal} onPress={stopRecording} />
        </View>
      ) : (
        <View style={{ marginBottom: 10 }}>
          <Ionicons name='mic' size={RFPercentage(3.3)} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default memo(RenderVoiceActions);

const styles = StyleSheet.create({
  recordingContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: Colors.grayColor,
    alignSelf: 'center',
    paddingBottom: 10,
    paddingHorizontal: 20,
    gap: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: width * 0.2 * 0.5,
    marginHorizontal: width * 0.2,
    height: width * 0.1,
  },
  deleteIcon: {
    marginTop: 8,
    marginLeft: 10,
  },
  recordingText: {
    fontSize: RFPercentage(2),
    color: Colors.primaryColor,
    marginTop: 4,
  },
  iconRoated: {
    transform: [{ rotate: '180deg' }],
    marginTop: 10,
  },
  iconNomal: {
    transform: [{ rotate: '0deg' }],
    marginTop: 10,
  },
});
