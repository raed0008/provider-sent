import { FlatList, View } from "react-native";
import { useLanguageContext } from "../../context/LanguageContext";
import { memo} from 'react'
import { Colors } from "../../constant/styles";
import { Dimensions } from "react-native";
import AppText from "../AppText";
import { RFPercentage } from "react-native-responsive-fontsize";
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet } from "react-native";

const { width, height } = Dimensions.get('screen')
const ServicesList = memo(({ data }) => {
    const { language } = useLanguageContext()
    const name = `name_${language}`
    return (
      <FlatList
        data={data}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
  
        keyExtractor={(item, index) => item.id}
        style={{
          display: "flex",
          flexDirection: "row",
          direction: "ltr",
          flexWrap: "wrap",
          marginTop: 15,
          gap: 15,
          padding: 5,
          paddingVertical: 10,
          borderRadius: 7,
          width: width * 0.9,
          backgroundColor: Colors.whiteColor,
          gap: 10,
  
        }}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: 'white',
                width: width * 0.80,
                gap: 15,
              }}
            >
              <MaterialIcons name="miscellaneous-services" size={24} color={Colors.grayColor} />
  
              <AppText
                centered={true}
                text={item?.attributes[name]}
                style={[styles.name, { fontSize: RFPercentage(1.75), width: width * 0.80, textAlign: language === 'ar' ? 'right' : 'left' }]}
              />
  
            </View>
          );
        }}
      />
    )
  })

  export default ServicesList

  const styles = StyleSheet.create({
    name: {
        fontSize: RFPercentage(1.95),
        color: Colors.blackColor,
      },
  });