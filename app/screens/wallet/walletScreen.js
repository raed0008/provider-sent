import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import React, { useState, memo, useCallback, useEffect } from "react";
import { Colors, Sizes } from "../../constant/styles";
import { StyleSheet } from "react-native";
import AppText from "../../component/AppText";
import AppButton from "../../component/AppButton";
import AppHeader from "../../component/AppHeader";
import ArrowBack from "../../component/ArrowBack";
import PaymentMethod from "../../component/payment/PaymentMethod";
import { CECKOUT_WEBVIEW_SCREEN, CHECkOUT_COUNTRY, CURRENCY, STCCHECKOUT, TABBYCHECKOUT } from "../../navigation/routes";
import { FontAwesome5 } from "@expo/vector-icons";
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import Dialog from "react-native-dialog";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from "react-redux";
import initiatePayment from "../../utils/Payment/Initate";
import { calculateTotalWithTax, fetchZipCode, getZipCode } from "../../utils/Payment/helpers";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getUserByPhoneNumber, updateUserData } from "../../../utils/user";
import { setUserData, userRegisterSuccess } from "../../store/features/userSlice";
import LoadingModal from "../../component/Loading";
import UseLocation from "../../../utils/useLocation";
import SuccessModel from "../../component/SuccessModal";
import AccountScreen from "../account/accountScreen";
import MultiPaymentMethod from "../../component/payment/MultiPaymentMethods";
import { ActivityIndicator } from "react-native-paper";
import LoadingScreen from "../loading/LoadingScreen";
import { initiateTabbyPayment } from "../payment/tabby/paymentData";
import { useLanguageContext } from "../../context/LanguageContext";
import { handleAuthorizePayment } from "../payment/StcPayment/StcHelpers";
import { sendPushNotification } from "../firebaseChat/helpers";

const { width } = Dimensions.get("screen");
export default function WalletScreen() {
  const { t } = useTranslation()
  const [loading, setIsLoading] = useState(false)
  const [state, setState] = useState({
    currentPaymentMethodIndex: 1,
    showSuccessDialog: false,
  });
  const user = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch();

  const [modalVisible, setShowModalVisible] = useState(false);

  const [amount, setAmmount] = useState(0);
  const updateState = (data) => setState((state) => ({ ...state, ...data }))
  const { currentPaymentMethodIndex, showSuccessDialog } = state;

  // Replace useFocusEffect with polling useEffect
  useEffect(() => {
    let interval;
    if (user?.attributes?.phoneNumber) {
      interval = setInterval(() => {
        getUserByPhoneNumber(user.attributes.phoneNumber)
          .then((updatedUser) => {
            if (updatedUser?.attributes?.wallet_amount !== user?.attributes?.wallet_amount) {
              dispatch(setUserData(updatedUser));
            }
          })
          .catch((err) => console.log("Error polling user data:", err));
      }, 10000); // every 10 seconds
    }

    return () => clearInterval(interval); // Stop checking when leaving the page
  }, [dispatch, user?.attributes?.phoneNumber, user?.attributes?.wallet_amount]);

  // console.log("the curent user is ",user?.attributes?.name)
  const multiPaymentArray = [
    require("../../assets/images/payment_icon/visa.png"),
    require("../../assets/images/payment_icon/master.png"),
    require("../../assets/images/payment_icon/mada.png"),

  ]
  if (loading) {
    return <LoadingScreen />
  }
  return (
    <View style={styles.container}>
      <ArrowBack subPage={true} custom={"Account"} />
      <ScrollView>
        <View style={styles.wrapper}>
          <AppText text={"Your Balance"} style={styles.text} />
          <View style={styles.currencyContainer}>

            <AppText text={`${user?.attributes?.wallet_amount || 0} `} style={styles.amount} />
            <AppText text={`${t("CURRENCY")} `} style={styles.amount} />
          </View>
        </View>

        <View style={styles.wrapper}>
          <View style={styles.HeaderContainer}>
            <FontAwesome5 name="money-check" size={16} color="black" />
            <AppText
              text={"Choose method to charge your wallet"}
              style={[styles.text]}
              centered={true}
            />
          </View>
          <View style={{ marginBottom: 10 }}>

            <MultiPaymentMethod
              icons={multiPaymentArray}
              paymentType="Card"
              index={1}
              updateState={updateState}
              currentPaymentMethodIndex={currentPaymentMethodIndex}
            />

            {
              Platform.OS === 'ios' &&
              <PaymentMethod
                icon={require("../../assets/images/payment_icon/apple.png")}
                paymentType="Card"
                index={4}
                updateState={updateState}
                currentPaymentMethodIndex={currentPaymentMethodIndex}
              />
            }
            <PaymentMethod
              icon={require("../../assets/images/payment_icon/stc.png")}
              paymentType="Card"
              index={2}
              updateState={updateState}
              currentPaymentMethodIndex={currentPaymentMethodIndex}
            />
            {/* <PaymentMethod
            icon={require("../../assets/images/payment_icon/tabby.png")}
            paymentType="Card"
            index={3}
            updateState={updateState}
            currentPaymentMethodIndex={currentPaymentMethodIndex}
          /> */}
            {/* <PaymentMethod
            icon={require("../../assets/images/payment_icon/sadad.png")}
            paymentType="Card"
            index={5}
            updateState={updateState}
            currentPaymentMethodIndex={currentPaymentMethodIndex}
          /> */}

          </View>
          <AppButton
            title={"Confirm"}
            disabled={!(currentPaymentMethodIndex)}
            textStyle={{ fontSize: RFPercentage(2.4) }}
            style={styles.button}
            onPress={() => setShowModalVisible(true)}
          // textStyle={{ color: Colors.whiteColor }}
          />

        </View>
        <HandleGetAmountComponentModal
          visible={modalVisible}
          updateState={updateState}
          currentPaymentMethodIndex={currentPaymentMethodIndex}
          // onPress={() => handleModalDismiss()}
          setVisible={setShowModalVisible}
          setIsLoading={setIsLoading}
        />
        <LoadingModal visible={loading} />
        <SuccessModel visible={showSuccessDialog} onPress={() => updateState({ showSuccessDialog: false })} />
      </ScrollView>
    </View>
  );
}



const HandleGetAmountComponentModal = memo(({ visible, setVisible, setIsLoading, updateState, currentPaymentMethodIndex }) => {
  const { t } = useTranslation();
  const [amount, setAmmount] = useState('');
  const [amountError, setAmountError] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.userData);
  const navigation = useNavigation();
  const { language, direction } = useLanguageContext();
  const backgroundColor = Colors.whiteColor;
  const textColor = Colors.blackColor;
  const cardBackgroundColor = '#f8f9fa';
  const borderColor = '#e0e0e0';
  const TEST_PHONES = new Set(['966566901540', '966511111111', '966522222222', '966500064849', '966565685614']);
  const normalizedPhone = String(user?.attributes?.phoneNumber || user?.phoneNumber || '').replace(/\D/g, '');

  const isTestUser = TEST_PHONES.has(normalizedPhone);
  const MIN_AMOUNT = isTestUser ? 1 : 50;


  // console.log("📱 user?.phoneNumber:", user?.phoneNumber);
  // console.log("🔎 normalizedPhone:", normalizedPhone);
  // console.log("✅ isTestUser:", isTestUser);
  // console.log("💰 MIN_AMOUNT:", MIN_AMOUNT);

  useEffect(() => {
    if (visible) {
      setAmountError(null);
      setAmmount('');
    }
  }, [visible]);

  const handleSetAmount = useCallback(
    (text) => {
      // Check if the text is numeric or empty
      if (/^\d*$/.test(text)) {
        setAmmount(text);
        console.log("text", text)
      }
    },
    [],
  )
  const handlePayOrder = async () => {
    console.log("the order Was payed Successfully with amount ", amount);
    if (!user) return;

    try {
      const res = await updateUserData(user.id, {
        wallet_amount: Number(user?.attributes?.wallet_amount) + Number(amount),
      });

      if (res) {
        // تحديث فوري من الباك اند
        const updatedUser = await getUserByPhoneNumber(user?.attributes?.phoneNumber);
        if (updatedUser) {
          dispatch(setUserData(updatedUser)); // تحديث Redux فوراً
        }

        sendPushNotification(
          user?.attributes?.expoPushNotificationToken,
          `تم شحن محفظتك بمبلغ ${amount} ${t("CURRENCY")} بنجاح 🎉`,
          "",
          'user',
          user?.id,
          false
        );

        updateState({ showSuccessDialog: true });
      } else {
        Alert.alert(t('A problem occurred, try again.'), "", [{ text: t('Ok') }]);
      }
    } catch (err) {
      console.log("error updating the user ", err.message);
    }
  };


  const handleGenererateInitator = (amount) => {
    console.log("amount is ", amount)
    setIsLoading(true)
    const orderAmmount = Number(amount)
    const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const username = user?.attributes?.name.trim(); // Remove any leading or trailing spaces
    const nameParts = username?.split(' '); // Split the username into parts

    const firstName = nameParts[0]; // The first part is the first namef
    const lastName = nameParts.slice(1).join(' '); // The rest are the last name
    const orderDetails = {
      orderId: `CHARGE_${uniqueId}`,
      amount: orderAmmount.toFixed(2),
      currency: CURRENCY,
      description: `Charge Wallet With amount of provider with amount of  ${Number(amount).toFixed(2)}`,
      payerFirstName: firstName,
      payerLastName: lastName,
      payerAddress: user?.attributes?.googleMapLocation?.readable,
      payerCountry: CHECkOUT_COUNTRY,
      payerCity: user?.attributes?.city,
      payerEmail: user?.attributes?.email,
      payerPhone: user?.attributes?.phoneNumber,
    };
    setVisible(false)
    setAmmount(null)
    initiatePayment(orderDetails)
      .then(response => {
        // console.log("the charge respons ie ",response?.redirect_url)
        navigation.navigate(CECKOUT_WEBVIEW_SCREEN, {
          url: response?.redirect_url,
          orderId: `CHARGE_${uniqueId}`,
          handlePayOrderFun: handlePayOrder
        })
        console.log('Payment initiated successfully:', response?.redirect_url)
      })
      .catch(error => {
        console.error('Error genereation payment:', error)
        // Alert.alert("Error genereation ", JSON.stringify(orderDetails), [ { text: "OK", }, ]);

      }).finally(() => {


        setIsLoading(false)
        setAmmount(null)

      }
      )


      ;
  }
  const handleTabbyPayment = async (amount) => {
    console.log("Amount is", amount);
    setIsLoading(true);
    const orderAmmount = Number(amount);
    const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const username = user?.attributes?.name.trim(); // Remove any leading or trailing spaces
    const nameParts = username?.split(' '); // Split the username into parts

    const firstName = nameParts[0]; // The first part is the first name
    const lastName = nameParts.slice(1).join(' '); // The rest are the last name

    const orderDetails = {
      amount: orderAmmount.toFixed(2),
      email: user?.email,
      phone: user?.phoneNumber,
      name: `${firstName} ${lastName}`,
      reference_id: `CHARGE_${uniqueId}`,
      city: user?.city,
      zip: user?.zip, // Assuming you have a zip code field
      address: user?.location
    };
    console.log('the tabby order details ', orderDetails)
    setVisible(false);
    setAmmount(null);

    try {
      const paymentUrl = await initiateTabbyPayment(orderDetails, language);
      navigation.navigate(TABBYCHECKOUT, {
        url: paymentUrl?.webUrl,
        sessionId: paymentUrl?.sessionId,
        orderId: `CHARGE_${uniqueId}`,
        handlePayOrderFun: handlePayOrder
      });
      console.log('Tabby Payment initiated successfully:', paymentUrl);
    } catch (error) {
      console.log('Error initiating Tabby payment:', error);
      // Handle error (e.g., show an alert)
    } finally {
      setIsLoading(false);
      setAmmount(null);
    }
  };
  const handleSTcPaymentInitate = async (amount) => {
    try {
      const phone = user?.attributes?.phoneNumber
      console.log('the user is ', user?.attributes?.phoneNumber)
      setIsLoading(true)
      setVisible(false)
      const response = await handleAuthorizePayment(amount, phone, t)
      if (response?.OtpReference) {
        navigation.navigate(STCCHECKOUT, {
          RefNum: response?.RefNum,
          BillNumber: response?.BillNumber,
          OtpReference: response?.OtpReference,
          STCPayPmtReference: response?.STCPayPmtReference,
          handlePayOrderFun: handlePayOrder,
          amount: response?.amount,
        });
        console.log('STC pay response:', response);
      }
      else {
        console.log('STC payment error:', response);
        // Alert.alert(t("Something Went Wrong, Please try again!"), "", [{ text: t('Ok') }]);
      }
    } catch (error) {
      console.log('Error generating STC payment:', error);
      // Alert.alert(t("STC Pay Error"), t("Failed to initiate STC Pay. Please try again."), [{ text: t('Ok') }]);
    } finally {
      setAmmount('');
      setIsLoading(false);
    }
  };

  // const getPaymentMethodName = () => {
  //   switch (currentPaymentMethodIndex) {
  //     case 1: return t("Credit/Debit Card");
  //     case 2: return t("STC Pay");
  //     case 3: return t("Tabby Installments");
  //     case 4: return t("Apple Pay");
  //     default: return t("Payment Method");
  //   }
  // };

  // const hasAnyInput = (amount ?? '').toString().trim().length > 0;
  // const quickAmounts = [50, 100, 200, 500];

  return (
    <Dialog.Container
      visible={visible}
      blurStyle={{ backgroundColor: Colors.whiteColor }}

      onBackdropPress={() => {
        setVisible(false)
        setAmmount(null)

      }}
      contentStyle={styles.dialogContainerStyle}
    >

      <AppText
        text={"Enter Charge Amount"}
        centered={true}
        style={styles.amountText}
      />
      <TouchableWithoutFeedback
        index={4}
        onPress={() => updateState({ currentPaymentMethodIndex: 4 })}
      >
        <View style={styles.amountContainer}>
          <TextInput
            keyboardType="numeric"
            selectionColor={Colors.primaryColor}
            value={amount}
            onChangeText={handleSetAmount}
            style={styles.input}
          />


          {/* <AppText text={CURRENCY} style={styles.currencyStyle}/> */}
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.buttonsContainer}>
        <AppButton
          title={"Confirm"}
          disabled={!amount || Number(amount) < MIN_AMOUNT}
          style={(!amount || Number(amount) < MIN_AMOUNT) ? styles.disabledButton : styles.button}
          onPress={() =>
            currentPaymentMethodIndex === 3
              ? handleTabbyPayment(amount)
              : currentPaymentMethodIndex === 2
                ? handleSTcPaymentInitate(amount)
                : handleGenererateInitator(amount)
          }
        />

      </View>
    </Dialog.Container>
  )
})
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteColor,
    height: "100%",
  },
  text: {
    color: Colors.blackColor,
    fontSize: RFValue(13),
  },
  amount: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(2.3)
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    marginTop: 6,
    width: width * 0.9,
    gap: 6,
    marginHorizontal: width * 0.05,
    borderRadius: 15,
    paddingVertical: 10,
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: Colors.piege,
  },
  button: {
    width: width * 0.4,
    marginVertical: 25,

  },
  CloseButton: {
    backgroundColor: 'red'
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  operation: {
    paddingVertical: 100,
    display: "flex",
    alignItems: "center",
  },
  amountText: {
    paddingHorizontal: 10,
    color: Colors.blackColor,
    fontSize: RFPercentage(2.5)
    // paddingTop:10
  },
  input: {
    color: "red",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: -10,
    fontSize: RFPercentage(2.8),
    borderColor: Colors.primaryColor,
    textAlign: 'center'
  },
  currencyContainer: {
    display: 'flex',
    flexDirection: 'row', gap: 5
  },
  amountContainer: {
    paddingVertical: 18,
    display: "flex",
    // paddingLeft:width*0.15,
    alignItems: "center",
    // justifyContent:'center',
    flexDirection: "row",
    gap: 20,
  },
  HeaderContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    alignItems: "center",
    // justifyContent:'center',
    gap: 10,
    // backgroundColor:'red',
    paddingVertical: 10,
    width: width * 0.8,
  },
  disabledButton: {
    // backgroundColor:"red",
    marginVertical: 25,
    marginTop: 10,
    paddingHorizontal: width * 0.15
  },
  dialogContainerStyle: {
    borderRadius: Sizes.fixPadding,
    width: width * 0.9,
    // paddingBottom: Sizes.fixPadding * 3.0,
    display: 'flex',
    alignItems: 'center',
    // gap:5,
    justifyContent: 'center'
  },
  currencyStyle: {
    color: Colors.primaryColor,

    fontSize: RFPercentage(2.5)

  }
});