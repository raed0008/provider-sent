import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
const { height , width} = Dimensions.get('screen')  
export const CustomMessageViewer = (props) => {
    const { imagePath } = props
    if (imagePath) {
        console.log("the image uri i ", imagePath)
        return (
            <View style={styles2.chatFooter}>
                <Image source={{ uri: imagePath }} style={{ height: height * 0.1, borderRadius: 15, width: width * 0.2 }} />
                <TouchableOpacity
                    onPress={() => props.handleImageSelected(imagePath)}
                    style={styles.buttonFooterChatImg}
                >
                    <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    buttonFooterChatImg: {
        backgroundColor: 'blue',
        height: 50,
        width: 50,
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 20,
        left: 0
    }
});