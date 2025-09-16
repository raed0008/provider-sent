import React, { Component } from 'react'
import { Text, View } from 'react-native'
import AppText from '../../component/AppText'
import { Colors } from '../../constant/styles'
import AppHeader from '../../component/AppHeader'
import AppButton from '../../component/AppButton'

export function ErrorScreen({ hanleRetry }) {
    return (
        <View>

            {/* <AppHeader /> */}
            <View style={{
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center',
                height: "100%",
                backgroundColor: Colors.whiteColor
            }}>
                <AppText text={"Network problem"} />
                <AppButton title={"Retry"} onPress={hanleRetry} />
            </View>
        </View>
    )
}

