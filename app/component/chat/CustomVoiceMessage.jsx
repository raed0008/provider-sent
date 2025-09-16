import { View, StyleSheet, Dimensions } from 'react-native'
import React, { useState, useEffect ,useRef} from 'react';
import { Feather ,AntDesign} from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Colors } from '../../constant/styles';
// import { Waveform } from '@simform_solutions/react-native-audio-waveform';
import { ProgressBar } from 'react-native-paper';
const { height, width } = Dimensions.get('screen')
export function CustomVoiceMessage({ currentMessage }) {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const ref = useRef(null);
    async function playSound() {
      console.log('Loading Sound');
      const { sound, status } = await Audio.Sound.createAsync({ uri: currentMessage.audio });
      setSound(sound);
      setDuration(status.durationMillis /  1000); // Convert duration to seconds
      console.log('Playing Sound');
      await sound.playAsync();
      setIsPlaying(true);
  
      // Add a listener for the sound to complete
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          console.log("sound findis")
          sound.unloadAsync(); // Unload the sound when it's done playing
        }
      });
    }
    useEffect(() => {
      if (sound) {
        const updatePosition = async () => {
          const currentPosition = await sound.getStatusAsync();
          setPosition(currentPosition.positionMillis /  1000); // Convert position to seconds
        };
  
        const intervalId = setInterval(updatePosition,  1000); // Update position every second
  
        return () => {
          clearInterval(intervalId);
          sound.unloadAsync();
        };
      }
    }, [sound]);
  
    // const safeProgress = Math.min(Math.max(position / duration,  0),  1);
    return (
      <View style={voiceStyles.container}>
        
        {
          isPlaying ?   
          <View style={voiceStyles.audio}>
  
          <AntDesign key="pause" name="pausecircleo" size={24} color={Colors.whiteColor}
          onPress={() => {
            sound?.pauseAsync();
            setIsPlaying(false);
          }} />
          </View>
          : 
          <View style={voiceStyles.audio}>
          <Feather key="play" name="play" size={24} color={Colors.whiteColor} onPress={() => {
            playSound();
            setIsPlaying(true);
          }}  />
        </View>
        }
{/* <ProgressBar color='white' progress={1/100} style={{backgroundColor:'white',width:50,height:10}}/> */}
<View>

    </View>
      </View>
    );
  }
  

  const voiceStyles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: height *  0.05,
      width: width * 0.3,
      // backgroundColor: Colors.primaryColor,
      borderRadius: width * 0.3 *  0.5
    },
    audio:{
      backgroundColor:Colors.primaryColor,
      padding:7,
  borderRadius:25,
  display:'flex',
      justifyContent:'center',
      alignItems:'center',
    }
  });
  