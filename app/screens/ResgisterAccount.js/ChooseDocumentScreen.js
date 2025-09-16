import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { CommonActions } from "@react-navigation/native";
import { ProgressBar } from "react-native-paper";
import { Colors, Sizes } from "../../constant/styles";
import AppText from "../../component/AppText";
import Logo from "../../component/Logo";
import AppForm from "../../component/Form/Form";
import ErrorMessage from "../../component/Form/ErrorMessage";
import FormField from "../../component/Form/FormField";
import SubmitButton from "../../component/Form/FormSubmitButton";
import { auth } from "../../../firebaseConfig";
import { EXPO_PUBLIC_BASE_URL, EXPO_PUBLIC_CLOUDINARY_PERSIST, EXPO_PUBLIC_CLOUDINARY_KEY } from "@env";
import LoadingModal from "../../component/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setItem } from "../../utils/secureStore";
import {
  setUserData,
  userRegisterSuccess,
} from "../../store/features/userSlice";
import { createUser } from "../../../utils/user";
import { MaterialIcons } from "@expo/vector-icons";

import { getLocationFromStorage } from "../../../utils/location";
import AppButton from "../../component/AppButton";
import ArrowBack from "../../component/ArrowBack";
import CitiesDropDownComponent from "./CitiesDropDownComponent";
import FormImagePicker from "../../component/Form/FormImagePicker";
import { min } from "date-fns";
import { setCurrentRegisterProperties } from "../../store/features/registerSlice";
import { ADDITION_INFO, ORDER_SUCCESS_SCREEN } from "../../navigation/routes";
import { RFPercentage } from "react-native-responsive-fontsize";
import { uploadImage } from "../firebaseChat/helpers";
import LocationPermissionComponent from "./LocationPermission/LocationPermissionComponent";
const { width, height } = Dimensions.get("screen");
const ChooseDocumentScreen = ({ navigation, route }) => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const MAX_RETRIES = 5; // Maximum number of upload attempts

  //  console.log(currentRegisterData)
  // const { phoneNumber } = route?.params
  const validationSchema = yup.object().shape({
    Personal_image: yup
      .array().min(1, (t("This Field is Required!"))).required(t("This Field is Required!")),
    Personal_card: yup
      .array()
      .min(1, (t("This Field is Required!")))
      .required(t("This Field is Required!")),
    Commercial_record: yup
      .array()

  });


  const handleFormSubmit = async (values) => {
    try {
      const userLocation = await getLocationFromStorage();
      setIsLoading(true);

      // ارفع كل صورة
      const ImagesData = await Promise.all([
        uploadImage(values.Commercial_record, values, "Commercial_record", MAX_RETRIES, console.log),
        uploadImage(values.Personal_card, values, "Personal_card", MAX_RETRIES, console.log),
        uploadImage(values.Personal_image, values, "Personal_image", MAX_RETRIES, console.log),
      ]);

      if (ImagesData?.length > 2) {
        const dataToSave = {
          Commercial_record: ImagesData[0]?.length > 0 ? ImagesData[0][0] : null,
          Personal_card: ImagesData[1]?.length > 0 ? ImagesData[1][0] : null,
          Personal_image: ImagesData[2]?.length > 0 ? ImagesData[2][0] : null,
        };

        // ✅ خزّنها في Redux
        dispatch(setCurrentRegisterProperties(dataToSave));

        // ✅ خزّنها في AsyncStorage
        await setItem("registerData", JSON.stringify(dataToSave));

        console.log("📂 الصور المخزنة:", dataToSave);

        setIsLoading(false);
        navigation.navigate(ADDITION_INFO, { status: route?.params?.status });
      }
    } catch (err) {
      console.log("❌ error creating the resi", err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: Colors.bodyBackColor, }}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <View style={{ flex: 1 }}>
        <MaterialIcons
          name="arrow-back"
          size={27}
          color="black"
          style={{
            marginHorizontal: Sizes.fixPadding * 2.0,
            marginTop: Sizes.fixPadding * 2.0,
          }}
          onPress={() => navigation.pop()}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoCotnainer}>{/* <Logo /> */}</View>
          <View style={{ flex: 1, alignItems: "center", }}>

            <AppForm
              enableReinitialize={true}
              initialValues={{
                Personal_image: [],
                Personal_card: [],
                Commercial_record: [],

              }}
              onSubmit={handleFormSubmit}
              validationSchema={validationSchema}
            >
              <ErrorMessage error={error} visible={error} />
              <HeaderComponent header={"PersonalCard"} />
              <FormImagePicker name="Personal_card" width={width} />

              <HeaderComponent header={"PersonalImage"} />
              <FormImagePicker name="Personal_image" width={width} />
              <HeaderComponent header={"CommercialRecord"} required={false} />
              <FormImagePicker name="Commercial_record" width={width} />

              <SubmitButton
                textStyle={{ fontSize: RFPercentage(2.2) }}
                title="Confirm"
                style={{ paddingHorizontal: RFPercentage(10), marginTop: RFPercentage(10) }}
              />

            </AppForm>
          </View>
        </ScrollView>
        <LocationPermissionComponent />
        <LoadingModal visible={isLoading} />
      </View>
    </View>
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
    // paddingVertical: 0,
    margin: 0,
    gap: 4,
  },
  header: {
    fontSize: RFPercentage(1.9),
    color: Colors.blackColor,
  },
  Star: {
    color: Colors.primaryColor,
  },
});

export default ChooseDocumentScreen;

const HeaderComponent = ({ header, required = true }) => (
  <View style={styles.headerContainer}>{
    required &&
    <AppText text={"*"} centered={true} style={styles.Star} />
  }
    <AppText text={header} centered={true} style={styles.header} />
  </View>
);
