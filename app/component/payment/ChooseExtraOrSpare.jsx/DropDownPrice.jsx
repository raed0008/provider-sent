
import tw from 'twrnc'
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { EvilIcons } from "@expo/vector-icons";
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useLanguageContext } from '../../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get("screen");

    const DropDownPrice = ({value, setValue}) => {
        const [isFocus, setIsFocus] = useState(false);
        const { language } = useLanguageContext()
        const { t } = useTranslation()
        const ChooseAdditionalPrice = [{ "label": "spare parts", "value": "قطع غيار", "arabicLabel": "قطع غيار" },
        { "label": "additional price", "value": "سعر إضافي", "arabicLabel": "سعر إضافي" }]
        return (
            <View style={tw`p-6`}>
                  <Dropdown
                    style={[styles.dropdown, isFocus && { borderColor: "blue" },]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    showsVerticalScrollIndicator={false}
                    data={ChooseAdditionalPrice}
                    maxHeight={300}
                    labelField={language === 'ar' ? 'arabicLabel' : 'label'}
                    valueField="value"
                    placeholder={value ? t(value) : t('additional price')}
                    searchPlaceholder={t("Search")}
                    value={value}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                        setValue(item.label);
                        setIsFocus(false);
                    }}
                    renderLeftIcon={() => (
                        <EvilIcons
                            style={styles.icon}
                            color={isFocus ? "blue" : "black"}
                            name="gear"
                            size={20}
                        />
                    )}
                />  
                </View>
        )
    }


export default DropDownPrice

const styles = StyleSheet.create({
    container: {
        padding: 16,
        width: width,
    },
    dropdown: {
        height: 50,
        borderColor: "gray",
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
  },
    icon: {
        marginRight: 5,
        marginTop: 5,
        marginHorizontal: 5,
    },
    placeholderStyle: {
        fontSize: RFPercentage(1.8),
        textAlign:'left'
    },
    selectedTextStyle: {
        fontSize: RFPercentage(2),
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: RFPercentage(2),
        backgroundColor:'red'
    },
});
