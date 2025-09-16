import { View, Text } from 'react-native';
import React, { useRef } from 'react';
import { Colors } from '../../constant/styles';
import { Waveform } from '@simform_solutions/react-native-audio-waveform';

export default function VoiceWaveForm({ path, staticWaveformViewStyles }) {
  const ref = useRef();

  // Define a function for onPanStateChange
  const handlePanStateChange = () => {
    console.log('Pan state changed');
  };

  return (
    <Waveform
      containerStyle={staticWaveformViewStyles}
      mode="live"
      key={path}
      ref={ref}
      path={'../../assets/Ring-tone-sound.mp3'}
      candleSpace={2}
      candleWidth={40}
      scrubColor={Colors.redColor}
      waveColor={Colors.redColor}
      onPlayerStateChange={() => console.log('Player state changed')}
      onPanStateChange={handlePanStateChange} // Pass the function reference here
      onError={(error) => {
        console.log(error, 'we are in example');
      }}
    />
  );
}
