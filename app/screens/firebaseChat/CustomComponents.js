import React from 'react';
import {  View, StyleSheet, Dimensions,Button} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, } from '../../constant/styles';


export const CustomSend = (props) => {
  return (
    <View style={styles.sendContainer}>
      <Button
        {...props}
        textColor={Colors.whiteColor}
        style={styles.send}
      >
    <Ionicons name="send" size={24} color="white" />
     </Button>
    </View>
  );
};

const styles = StyleSheet.create({
 
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal:5
  },
  send: {
    color: Colors.whiteColor,
    fontSize:  18,
    fontWeight: '600',
    
    backgroundColor:Colors.primaryColor,
    
    padding:2,
    paddingHorizontal:6,
    borderRadius:15
  },
  chatFooter:{
    backgroundColor:"red",
    borderWidth:1,
    position:'relative'
  },
  buttonFooterChatImg:{
    backgroundColor:'blue',
    height:50,
    width:50,
    borderRadius:50,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    position:'absolute',
    top:20,
    left:0
  }
});






