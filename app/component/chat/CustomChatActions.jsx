import { View, StyleSheet ,Dimensions} from 'react-native'
import React ,{memo} from 'react'
import { Actions } from 'react-native-gifted-chat'

import { Colors } from '../../constant/styles'
import CustomImagePicker from '../../screens/firebaseChat/ImagePicker'
import { handleImageSelected } from '../../screens/firebaseChat/helpers'
import { RFPercentage } from 'react-native-responsive-fontsize'

const { height, width } = Dimensions.get('screen')

function CustomChatActions(props) {
    const { userId, setIsUploading, user, setMessages, sendPushNotification, currentChannelName, CurrentChatRoom,setProgressValue ,item} = props
    return (
        <Actions
            onPressActionButton={() => console.log("show image picker")}
            containerStyle={styles.container}
            icon={() => (
                <View style={styles.actionsContainer}>
                    <View style={{ marginTop: -8}} >
                        <CustomImagePicker onImageSelected={(imageUri) => handleImageSelected(imageUri, userId, setIsUploading, user, setMessages, sendPushNotification, currentChannelName, CurrentChatRoom,setProgressValue,item)} />
                    </View>
                </View>
            )}
        />
    )
}
export default memo(CustomChatActions)

const styles = StyleSheet.create({
    container: {
        // marginBottom: 8,
        marginLeft: RFPercentage(1.45),
        marginRight: RFPercentage(1.9),
        backgroundColor: 'white',
        // padding: 1, 
        borderRadius: width * 0.09 * 0.5, 
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
         height: height * 0.04, 
        //  width: width * 0.09/
    },
    actionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
});