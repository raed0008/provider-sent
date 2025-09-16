import { View, Text } from 'react-native'
import React, { memo } from 'react'
import AppButton from '../../AppButton'

const ButtonActionsComponent = ({title,style,textStyle,onPress,conditionRender}) => {
    if(!conditionRender) return null
  return (
    <AppButton
    title={title}
    textStyle={textStyle}
    style={style}
    onPress={onPress}
  />
  )
}

export default memo(ButtonActionsComponent)