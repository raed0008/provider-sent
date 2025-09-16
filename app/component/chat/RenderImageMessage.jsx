import { View, StyleSheet, Image } from 'react-native'
import React from 'react'

export const renderMessageImage = ({ currentMessage }) => {
    console.log('current image ',currentMessage.image)
    return(
    <TouchableOpacity >
      <Image source={{ uri: currentMessage?.image }} style={styles.image} />
    </TouchableOpacity>
  )};

  const styles = StyleSheet.create(
      {
        image :{

      }
    }
  )
  