import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import * as yup from "yup";

import ArrowBack from "../../component/ArrowBack";
import { Colors } from "../../constant/styles";
import AppText from "../../component/AppText";
import AppForm from "../../component/Form/Form";
import ErrorMessage from "../../component/Form/ErrorMessage";
import FormField from "../../component/Form/FormField";
import SubmitButton from "../../component/Form/FormSubmitButton";
import { auth } from "../../../firebaseConfig";

import LoadingModal from "../../component/Loading";
import { useDispatch, useSelector } from "react-redux";
import { getUserByPhoneNumber, updateUserData } from "../../../utils/user";
import { setUserData } from "../../store/features/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { HOME, SELECT_LAN } from "../../navigation/routes";
import { useTranslation } from "react-i18next";
import DocumentDownloadComponent from "../../component/Account/DocumentDownloadComponent";
import FormDatePicker from "../../component/Form/FormDatePicker";
import { Switch } from "react-native-elements";
import AppButton from "../../component/AppButton";
import { AntDesign} from '@expo/vector-icons'
import NotificationComponent from "../../component/notifications/NotificationComponent";
import useCurrentOrders from "../../hooks/useCurrentOrders";
import { HandleDeleteAcount } from "../../utils/Account/UserInfoUtilites";
import { RFPercentage } from "react-native-responsive-fontsize";
import tw from 'twrnc'
import { useLanguageContext } from "../../context/LanguageContext";
import { getCurrentNearOrders } from "../../../utils/orders";
const { width } = Dimensions.get("screen");

const UserInfo = ({ navigation }) => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const validPhone = auth?.currentUser?.phoneNumber?.replace("+", "");
  const userData = useSelector((state) => state?.user?.userData);
  const { t } = useTranslation();
 const { data:currentOrders}= getCurrentNearOrders(userData?.id,'current')
 const { language} = useLanguageContext()
  const validationSchema = yup.object().shape({
    fullName: yup
      .string()
      .min(2, "الاسم  المدخل قصير جدا")
      .max(50, "الاسم المدخل طويل جدا"),
    emailAddress: yup.string().email("الايميل المدخل غير صالح"),
    location: yup.string(),
  });
  const handleFormSubmit = async (values) => {
    try {
      setIsLoading(true);
      const res = await updateUserData(userData?.id, {
        email: values?.emailAddress || userData?.attributes?.email,
        name: values?.fullName || userData?.attributes?.name,
      });
      if (res) {
        const gottenuser = await getUserByPhoneNumber(Number(validPhone));
        dispatch(setUserData(gottenuser));
        Alert.alert(t("Done successfully"),"",[{text:t('Ok')}]);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: t(HOME) }],
          })
        );
      } else {
        Alert.alert(t('A problem occurred, try again.'),"",[{text:t('Ok')}]);
      }
    } catch (err) {
      console.log("error creating the resi", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const userData = JSON.parse(userDataString);
      const validPhone = `${userData?.phoneNumber?.replace(/\s/g, "").trim()}`;
      const PhoneNumberValidated = convertPhoneTovalid(validPhone);
      if (userData?.phoneNumber) {
        const gottenuser = await getUserByPhoneNumber(PhoneNumberValidated);
        dispatch(setUserData(gottenuser));
      } else {
      }
    } catch (error) {
      console.log("error getting the user fo rthe fir", error);
    }
  };
  console.log("user data bir",userData?.attributes?.Personal_image)
  const convertPhoneTovalid = (phone) => {
    const phoneNumberWithoutPlus = phone?.replace("+", "");

    // Convert the string to a number
    const phoneNumber = Number(phoneNumberWithoutPlus);
    return phoneNumber;
  };

  useEffect(() => {
    getUserInfo();
  }, [dispatch]);
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bodyBackColor }}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <View style={{ flex: 1 }}>
<View style={{ alignItems: 'center' }}>
      <View style={[styles.headerContainer2,tw`flex ${language === 'ar' ? 'flex-row':'flex-row-reverse'}`]}>
        <View style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
        <NotificationComponent />
        <AntDesign onPress={()=>navigation?.navigate(SELECT_LAN)} name="earth" size={RFPercentage(3)} color={Colors.primaryColor}/>

        </View>
        <ArrowBack />
       </View> 
        {/* <ArrowBack /> */}

        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
<View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 40 }}>
            <AppText
              text={"Personal information"}
              style={{ color: Colors.primaryColor, marginBottom: 10,    fontSize: RFPercentage(2),
              }}
            />
            <AppForm
              enableReinitialize={true}
              initialValues={{ fullName: "", emailAddress: "", location: "" }}
              onSubmit={(data) => handleFormSubmit(data)}
              validationSchema={validationSchema}
            >
              <ErrorMessage error={error} visible={error} />
              {
                userData?.attributes?.Personal_image &&
              <View style={styles.ImageContainer}>
                <Image
                  source={{
                    uri: userData?.attributes?.Personal_image
                  }}
                  
                  style={styles.image}
                  />
              </View>
                }
              <HeaderComponent header={"fullName"} />
              <FormField
                autoCorrect={false}
                name="fullName"
                icon={"user"}
                style={styles.inputStyle}
                editable={false}
                activeUnderlineColor={"#FFF"}
                underlineStyle={{ borderWidth: 0, backgroundColor: "#fff" }}
                placeholderTextColor={Colors.blackColor}
                placeholder={userData?.attributes?.name}
              />
              <HeaderComponent header={"city"} />

              <FormField
                autoCorrect={false}
                name="city"
                icon={"user"}
                placeholderTextColor={Colors.blackColor}
                style={styles.inputStyle}
                editable={false}
                placeholder={userData?.attributes?.city}
              />
              <HeaderComponent header={"phoneNumber"} />

              <FormField
                autoCorrect={false}
                name="fullName"
                icon={"user"}
                placeholderTextColor={Colors.blackColor}
                style={styles.inputStyle}
                editable={false}
                placeholder={userData?.attributes?.phoneNumber}
              />
              <HeaderComponent header={"Birth Date"} />
                 <FormField
                autoCorrect={false}
                name="fullName"
                icon={"user"}
                placeholderTextColor={Colors.blackColor}
                style={styles.inputStyle}
                editable={false}
                value={userData?.attributes?.birth_date}
              />
              <HeaderComponent header={"Documents"} />

              <DocumentDownloadComponent />
          
           <AppButton
  title={"Delete Account"}
  style={{ backgroundColor: 'red', paddingHorizontal: RFPercentage(4.2) }}
  onPress={() => {
    HandleDeleteAcount(currentOrders, userData, t);
  }}
/>

            </AppForm>
          </View>
        </ScrollView>
        <LoadingModal visible={isLoading} />
      </View>
    </View>
  );
};

export default UserInfo;

const styles = StyleSheet.create({
  inputStyle: {
  borderWidth: 1,
  width: '100%', // يخلي الحقول تمتد حسب الحاوية
  maxWidth: 500, // مناسب للشاشات الكبيرة
  backgroundColor: Colors.whiteColor,
  justifyContent: 'center',
  borderRadius: 6,

},

  dateStyle: {
    // borderWidth: 1,
    width: width * 0.95,
    marginRight:-width*0.04,
    backgroundColor: Colors.whiteColor,
    borderRadius: 10,
    padding:10,
    
    alignSelf:'center',
    margin:"auto",
    padding:4,
    marginTop:5
  },
  ImageContainer: {
  width: '100%',
  maxWidth: 500,
  alignItems: "center",
  justifyContent: "center",
  paddingTop: width * 0.05,
  paddingBottom: width * 0.03,
  },
  image: {
    height: width * 0.3,
    // borderWidth:4,
    // borderColor:Colors.blueColor,
    width: width * 0.3,
    margin: "auto",
    borderRadius: width * 0.3 * 0.5,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    width: width,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 27,
    marginBottom: -13,
    // paddingVertical: 0,
    marginTop:5,
    margin: 0,
    gap: 4,
  },headerContainer2: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 15,  // نفس الـ padding المستخدم في باقي الصفحة
  paddingTop: 10,
  width: '100%',
  maxWidth: 500,           // لمحاذاة موحدة مع النموذج
  alignSelf: 'center',     // يخليه بالنص على الشاشات الواسعة
  
  },
  header: {
    fontSize: RFPercentage(1.6),
    color: Colors.blackColor,
    marginBottom:10
  },
  Star: {
    color: Colors.primaryColor,
  },
  switchContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.90,
    marginHorizontal:width*0.4
  },allow_offers:{
    color:Colors.primaryColor
  }
});

const HeaderComponent = ({ header }) => (
  <View style={styles.headerContainer}>
    <AppText text={"*"} centered={true} style={styles.Star} />
    <AppText text={header} centered={true} style={styles.header} />
  </View>
);