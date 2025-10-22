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
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import { CommonActions } from "@react-navigation/native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

import AppText from "../../component/AppText";
import AppForm from "../../component/Form/Form";
import { Colors, Sizes } from "../../constant/styles";
import ErrorMessage from "../../component/Form/ErrorMessage";
import FormField from "../../component/Form/FormField";
import SubmitButton from "../../component/Form/FormSubmitButton";
import LoadingModal from "../../component/Loading";
import { setItem } from "../../utils/secureStore";
import {
  setUserData,
  userRegisterSuccess,
} from "../../store/features/userSlice";
import { createUser, updateUserData } from "../../../utils/user";

import CitiesDropDownComponent from "./CitiesDropDownComponent";
import { setCurrentRegisterProperties } from "../../store/features/registerSlice";
import { ORDER_SUCCESS_SCREEN } from "../../navigation/routes";
import FormDatePicker from "../../component/Form/FormDatePicker";
import useNotifications from "../../../utils/notifications";
import UseLocation from "../../../utils/useLocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProminentDisclosure from "../../component/ProminentDisclosure";
const { width, height } = Dimensions.get("screen");

const AdditionInfoScreen = ({ navigation, route }) => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const registerData = useSelector(
    (state) => state.register.currentRegisterDate
  );
  const { token } = useNotifications();
  const user = useSelector((state) => state.user.userData);
  console.log("USER DATA DEBUG:", user);

  const [city, setCity] = useState(null);
  const { location: userCurrentLocation, coordinate } = UseLocation();
  const [currentLocation, setCurrenttLocation] = useState();
  const currentRegisterData = useSelector(
    (state) => state?.register.currentRegisterDate
  );
  const [agreamentStatus, setAgreamentStatus] = useState(false);
  const [savedRegisterData, setSavedRegisterData] = useState(null);
  const [isRegisterDataReady, setIsRegisterDataReady] = useState(false);
  const normalizePhone = (raw) => {
    let p = (raw || "").replace(/\D/g, "");
    if (p.startsWith("00")) p = p.slice(2);
    if (p.startsWith("0")) p = "966" + p.slice(1);
    if (!p.startsWith("966")) p = "966" + p;
    return p;
  };

  const pseudoEmailFromPhone = (rawPhone) => {
    const phone = normalizePhone(rawPhone);
    return `id${phone}client@njik.sa`;
  };

  const CityField = ({ value, setValue }) => {
    const { setFieldValue, errors, touched } = useFormikContext();

    return (
      <>
        <CitiesDropDownComponent
          value={value}
          setValue={(val) => {
            setValue(val);
            setFieldValue("city", val);
          }}
        />
        {touched.city && errors.city && (
          <ErrorMessage error={errors.city} visible={true} />
        )}
      </>
    );
  };

  // إضافة selector للحصول على بيانات المستخدم المسجل
  const loggedUser = useSelector((state) => state.user.user);

  const validationSchema = yup.object().shape({
    Additional_phone: yup.string().required(t("This Field is Required!")),
    IdNumber: yup.string().required(t("This Field is Required!")),
    city: yup.string().required(t("This Field is Required!")),
  });

  const saveUserData = async (res, loggedUser) => {
    let dataToSave;

    if (res?.id) {
      dataToSave = res;
    } else if (res?.data?.id) {
      dataToSave = res.data;
    } else if (loggedUser?.id) {
      dataToSave = loggedUser;
    } else {
      console.log("❌ No user data to save");
      return;
    }

    console.log("💾 Saving user:", dataToSave);

    dispatch(userRegisterSuccess(dataToSave));
    await setItem("userData", JSON.stringify(dataToSave));
    dispatch(setUserData(dataToSave));
  };

  useEffect(() => {
    const registerPushToken = async () => {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (finalStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("❌ Notification permissions not granted");
          return;
        }

        const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("📲 Current Expo push token:", pushToken);

        await AsyncStorage.setItem("expoPushToken", pushToken);

        if (user?.id) {
          await updateUserData(user.id, {
            expoPushNotificationToken: pushToken,
          });
          console.log("✅ Token updated in backend for user:", user.id);
        }
      } catch (err) {
        console.log("❌ Error registering push token:", err);
      }
    };

    registerPushToken();
  }, [user?.id]);

  useEffect(() => {
    (async () => {
      try {
        const storedRegister = await AsyncStorage.getItem("registerData");
        const storedCategories = await AsyncStorage.getItem(
          "registerDataCategories"
        );

        let merged = {};
        if (storedRegister)
          merged = { ...merged, ...JSON.parse(storedRegister) };
        if (storedCategories)
          merged = { ...merged, ...JSON.parse(storedCategories) };

        // اندمج مع اللي موجود بالريدكس لو فيه
        if (registerData) merged = { ...merged, ...registerData };

        setSavedRegisterData(merged);
        setIsRegisterDataReady(true); // صار جاهز
        console.log("📦 Effective Register Data:", merged);
      } catch (err) {
        console.log("❌ Error loading register data from storage:", err);
        setIsRegisterDataReady(true); // حتى لو خطأ
      }
    })();
  }, [registerData]);

  const handleFormSubmit = async (values) => {
    if (!isRegisterDataReady) {
      Alert.alert("Please wait", "Loading registration data...");
      return;
    }
    console.log("🟢 handleFormSubmit called with:", values);
    try {
      setIsLoading(true);

      const effectiveRegisterData = savedRegisterData || registerData;

      if (
        !effectiveRegisterData ||
        !effectiveRegisterData.FirstName ||
        !effectiveRegisterData.MiddleName
      ) {
        Alert.alert(
          t("Error"),
          t(
            "Registration data is missing. Please go back and fill the form again."
          ),
          [{ text: t("Ok") }]
        );
        return;
      }

      const name = `${effectiveRegisterData.FirstName} ${effectiveRegisterData.MiddleName}`;
      const phoneNumber = loggedUser?.phoneNumber;

      const normalizedPhone = normalizePhone(phoneNumber);
      const pseudoEmail = pseudoEmailFromPhone(normalizedPhone);

      let res;

      if (user?.id) {
        const isRejected = user?.attributes?.Provider_status === "rejected";

        const updatePayload = {
          ...values,
          name: user?.attributes?.name || name,
          city: city || user?.attributes?.city,
          IdNumber: values.IdNumber || user?.attributes?.IdNumber,
          expoPushNotificationToken: token,
          googleMapLocation: currentLocation
            ? currentLocation
            : userCurrentLocation,
          phoneNumber: user?.attributes?.phoneNumber || phoneNumber,
          email: pseudoEmail,
        };

        if (isRejected) {
          updatePayload.Provider_status = "pending";
        }

        // أضف الصور المحفوظة مباشرة
        if (effectiveRegisterData?.Personal_card) {
          updatePayload.Personal_card = effectiveRegisterData.Personal_card;
        }
        if (effectiveRegisterData?.Personal_image) {
          updatePayload.Personal_image = effectiveRegisterData.Personal_image;
        }
        if (effectiveRegisterData?.Commercial_record) {
          updatePayload.Commercial_record =
            effectiveRegisterData.Commercial_record;
        }

        Object.keys(updatePayload).forEach((key) => {
          if (!updatePayload[key]) delete updatePayload[key];
        });

        console.log("📤 Update Payload:", updatePayload);
        res = await updateUserData(user.id, updatePayload);
      } else {
        const payload = {
          ...effectiveRegisterData,
          ...values,
          name,
          expoPushNotificationToken: token,
          googleMapLocation: currentLocation
            ? currentLocation
            : userCurrentLocation,
          phoneNumber,
          city,
          email: pseudoEmail,
        };

        // أضف الصور المحفوظة مباشرة
        if (effectiveRegisterData?.Personal_card) {
          payload.Personal_card = effectiveRegisterData.Personal_card;
        }
        if (effectiveRegisterData?.Personal_image) {
          payload.Personal_image = effectiveRegisterData.Personal_image;
        }
        if (effectiveRegisterData?.Commercial_record) {
          payload.Commercial_record = effectiveRegisterData.Commercial_record;
        }

        Object.keys(payload).forEach((key) => {
          if (payload[key] === null || payload[key] === undefined) {
            delete payload[key];
          }
        });

        console.log("📤 Create Payload:", payload);
        res = await createUser(payload);
      }

      dispatch(setCurrentRegisterProperties({ ...values }));
      await saveUserData(res, loggedUser);

      if (res || loggedUser) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t("sign up success"),
            body: t(
              "Your application as a service provider has been submitted successfully."
            ),
            channelId: "register",
          },
          trigger: null,
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ORDER_SUCCESS_SCREEN }],
          })
        );
      }
    } catch (err) {
      console.log("Error creating/updating user:", err.message);
      Alert.alert(t("Error"), t("Something went wrong. Please try again."), [
        { text: t("Ok") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const currentLocation = await AsyncStorage.getItem("userLocation");
      setCurrenttLocation(JSON.parse(currentLocation));
    })();
  }, []);

  useEffect(() => {
    getStatus();
  }, [agreamentStatus]);

  const getStatus = async () => {
    const status = await AsyncStorage.getItem(
      "agreeLocationProminentDisclosure"
    );
    if (status === "true") {
      setAgreamentStatus(true);
      console.log("Agreement status set to true");
    } else {
      console.log("Agreement status not set to true");
    }
  };

  if (!agreamentStatus)
    return <ProminentDisclosure setAgreamentStatus={setAgreamentStatus} />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bodyBackColor }}>
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
          <View style={{ flex: 1, alignItems: "center" }}>
            <AppForm
              enableReinitialize={true}
              initialValues={{
                Additional_phone: loggedUser?.phoneNumber || "",
                IdNumber: "",
                city: "",
              }}
              onSubmit={handleFormSubmit}
              validationSchema={validationSchema}
            >
              <ErrorMessage error={error} visible={error} />

              {/* <HeaderComponent header={"Email Address"} />
              <FormField
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                name="email"
              /> */}

              {/* <View style={{ marginBottom: 10 }}>
                <HeaderComponent header={"Birth Date"} />
              </View>
              <FormDatePicker birth={true} name="birth_date" birthDate={Date.now()} /> */}

              <HeaderComponent
                header={"Identification Number"}
                headerStyle={{ paddingTop: 10 }}
              />
              <FormField autoCorrect={false} icon="account" name="IdNumber" />

              <HeaderComponent header={"Choose City"} />
              <CityField value={city} setValue={setCity} />

              <View style={styles.termsContainer}>
                <FontAwesome
                  name="edit"
                  size={24}
                  color={Colors.primaryColor}
                />
                <AppText
                  text={
                    "By Creating an account you accept our Terms and Condition"
                  }
                  style={{
                    color: Colors.blackColor,
                    fontSize: RFPercentage(1.5),
                    minWidth: width * 0.86,
                    textAlign: "left",
                    marginLeft: 10,
                  }}
                />
              </View>

              <SubmitButton
                title="Register"
                textStyle={{ fontSize: RFPercentage(2) }}
                style={{ paddingHorizontal: RFPercentage(10), marginTop: 40 }}
              />
            </AppForm>
          </View>
        </ScrollView>
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
    margin: 0,
    marginBottom: -12,
    gap: 4,
  },
  header: {
    fontSize: RFPercentage(1.8),
    color: Colors.blackColor,
    marginBottom: 10,
  },
  Star: {
    color: Colors.primaryColor,
  },
});

export default AdditionInfoScreen;

const HeaderComponent = ({ header, headerStyle }) => (
  <View style={[styles?.headerContainer, headerStyle]}>
    <AppText text={"*"} centered={true} style={styles.Star} />
    <AppText text={header} centered={true} style={styles.header} />
  </View>
);
