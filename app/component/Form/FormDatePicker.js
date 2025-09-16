import React, { memo, useState ,useCallback} from "react";
import { useFormikContext } from "formik";
import { format } from "date-fns";
import { arSA ,enUS } from "date-fns/locale"; // Import the Saudi Arabian locale
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dimensions, StyleSheet, TouchableOpacity, TextInput,View ,Platform} from "react-native";

import ErrorMessage from "./ErrorMessage";
import { Ionicons } from "@expo/vector-icons";
import { useLanguageContext } from "../../context/LanguageContext";

const { width } = Dimensions.get("screen");

function FormDatePicker({ name, width, birth =false,...otherProps }) {
  const { setFieldTouched, setFieldValue, errors, touched, values } =
    useFormikContext();
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const today = new Date();
  const maximumDate = birth ? today : undefined;
  const minimumDate = birth ? undefined : today;
  const { language} = useLanguageContext()
  const formattedDate = format(date, "dd MMMM yyyy", {
    locale: language === "ar" ? arSA : enUS,
  });
  const onChange = useCallback((event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios"); // Hide the DateTimePicker for iOS
    setDate(currentDate);
    setFieldValue(name, currentDate);
  },[])

  const showMode = useCallback(
    (currentMode) => {
      setShow(true);
      setMode(currentMode);
    },
    [],
  )
  

  const showDatepicker = () => {
    showMode("date");
  };


  return (
    <>
      <TouchableOpacity onPress={showDatepicker}>
        <View style={styles.date}>
          <TextInput
            onChangeText={(text) => setFieldValue(name, text)}
            value={formattedDate}
            editable={false}
            onBlur={() => setFieldTouched(name)}
          />
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          style={{backgroundColor:'white', position:'absolute',top:0,left:10,height:35,width:130}}
          is24Hour={true}
          display="default"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        
          // minimumDate={new Date()}
          onChange={onChange}
          locale={language === "ar" ? "ar-SA" : "en-US"} // This ensures the picker displays dates in the correct language

          
        />)
      }
          <Ionicons name="calendar" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>)
}


export default memo(FormDatePicker);

const styles = StyleSheet.create({
  date: {
    borderWidth: 1,
    width: width * 0.93,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical:8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
