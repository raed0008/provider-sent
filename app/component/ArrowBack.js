
import React from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { Sizes } from "../constant/styles";
import { useNavigation } from "@react-navigation/native";
import { RFPercentage } from "react-native-responsive-fontsize";

export default function ArrowBack({custom,style}) {
    const navigation = useNavigation()
    return (
        <MaterialIcons
            name="arrow-back"
            size={RFPercentage(2.8)}
            color="black"
            style={{
                marginHorizontal: Sizes.fixPadding * 2.0,
                marginVertical: Sizes.fixPadding * 2.0,
                ...style
            }}
            onPress={() =>{
                if(custom){
                    navigation.navigate(custom)
                }else if (navigation.canGoBack()) {
                    navigation.goBack();
           
                  }
            }}
        />
    )
}