import { useTranslation } from "react-i18next";
import { Dimensions, TextInput ,StyleSheet} from "react-native";
import { Colors, mainFont } from "../../constant/styles";
import { useLanguageContext } from "../../context/LanguageContext";
import { useState} from 'react'

const {height,width } = Dimensions.get('screen')
export const CustomComposer = (props) => {
    const { t } = useTranslation();
    const [FitHeight, setHeight] = useState(height*0.17); // Initial height
    const { language } = useLanguageContext()
  const onContentSizeChange = (contentWidth, contentHeight) => {
    // Adjust the height based on the content height
    setHeight(contentHeight < 40 ? 40 : contentHeight);
    props.setCustomHeight(contentHeight < 40 ? 40 : contentHeight)
  };
    return (
      <TextInput
        {...props}
        cursorColor={Colors.primaryColor}
        placeholder={t("Type a message....")}
        placeholderTextColor='#999'
        style={[styles.composer,{height:FitHeight,borderRadius:FitHeight*0.14,paddingLeft:20,    textAlign:language === 'ar'?'right':'left',
        width:props?.textInputValue ? width*0.82 : width * 0.72,display:props?.recording ? 'none':'flex'}]}
        multiline={true}
        
        numberOfLines={4}
        onContentSizeChange={(e) =>
            onContentSizeChange(e.nativeEvent.contentSize.width, e.nativeEvent.contentSize.height)
          }
        onChangeText={(text) =>{
            props.setText(text)
        }}
        value={props?.textInputValue}
      
      
      />
    );
  };
  const styles = StyleSheet.create({
    composer: {
        borderColor: '#ccc',
        borderWidth:  0.8,
        borderRadius:  height*0.01,
      paddingLeft:  10,
      padding:10,

      fontFamily:mainFont.bold,
      writingDirection:'rtl',
    },
  });