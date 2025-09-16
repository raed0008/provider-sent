import React from 'react';
import { View, Text, Button } from 'react-native';

const SuccessScreen = ({ navigation }) => (
  <View>
    <Text>Payment Successful!</Text>
    <Button title="Go Home" onPress={() => navigation.navigate('HomeScreen')} />
  </View>
);

const FailureScreen = ({ navigation }) => (
  <View>
    <Text>Payment Failed</Text>
    <Button title="Go Home" onPress={() => navigation.navigate('HomeScreen')} />
  </View>
);

export { SuccessScreen, FailureScreen };
