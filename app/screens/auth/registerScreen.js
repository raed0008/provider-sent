import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constant/styles";
import AppText from "../../component/AppText";
import Logo from "../../component/Logo";
import AppForm from "../../component/Form/Form";
import ErrorMessage from "../../component/Form/ErrorMessage";
import FormField from "../../component/Form/FormField";
import SubmitButton from "../../component/Form/FormSubmitButton";
import LoadingModal from "../../component/Loading";

import { setCurrentRegisterProperties } from "../../store/features/registerSlice";
import { CHOOSE_CATEGORIES } from "../../navigation/routes";
import { RFPercentage } from "react-native-responsive-fontsize";
import LocationPermissionComponent from "../ResgisterAccount.js/LocationPermission/LocationPermissionComponent";

const { width,height} = Dimensions.get('screen')

const RegisterScreen = ({ navigation,route}) => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const validationSchema = yup.object().shape({
    FirstName: yup
      .string()
      .required(t("This Field is Required!"))
      .min(3,t("Name is too short"))
      .max(50,t("Name is too long")),
    MiddleName: yup
      .string()
      .required(t("This Field is Required!"))
      .min(3,t("Name is too short"))
      .max(50,t("Name is too long")),
    
  });

  const handleFormSubmit = async (values) => {
    try {      
      setIsLoading(true);
      dispatch(setCurrentRegisterProperties({...values}));
      await AsyncStorage.setItem("registerData", JSON.stringify(values));
      navigation.navigate(CHOOSE_CATEGORIES)
    
    } catch (err) {
      console.log("error creating the resi", err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bodyBackColor }}>
    <StatusBar backgroundColor={Colors.primaryColor} />
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.logoCotnainer}>
          <Logo />
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <AppText
            text={"Register As Provider"}
            style={{ color: Colors.primaryColor, marginBottom: 10 ,fontSize:RFPercentage(1.9)}}
          />
          <AppForm
            enableReinitialize={true}
            initialValues={{
             FirstName:"",
             MiddleName:""
            }}
            onSubmit={handleFormSubmit}
            validationSchema={validationSchema}
          >
            <ErrorMessage error={error} visible={error} />
            <HeaderComponent header={"First Name"} />
            <FormField
              autoCorrect={false}
              icon="account"
              name="FirstName"
              // placeholdesr="fullName"
            />
            
            <HeaderComponent header={"Last Name"} />
            <FormField
              autoCorrect={false}
              icon="account"
              name="MiddleName"
              // placeholdesr="fullName"
            />
            
            <SubmitButton title="Confirm" style={{paddingHorizontal:60,marginTop:40}} />
           
          </AppForm>
        </View>
      </ScrollView>
      <LocationPermissionComponent />

      <LoadingModal visible={isLoading} />
    </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  termsContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    padding: 15,
    gap: 0,
    width: width,
    // flexWrap:'wrap'
  },
  logoCotnainer: {
    margin: 10,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    width: width,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginBottom:-13,
    // paddingVertical: 0,
    margin: 0,
    gap: 4,
  },
  header: {
    fontSize:RFPercentage(1.6),
        color: Colors.blackColor,
        marginBottom:8
  },
  Star: {
    color: Colors.primaryColor,
  },
});

export default RegisterScreen;

const HeaderComponent = ({ header }) => (
  <View style={styles.headerContainer}>
    <AppText text={"*"} centered={true} style={styles.Star} />
    <AppText text={header} centered={true} style={styles.header} />
  </View>
);
