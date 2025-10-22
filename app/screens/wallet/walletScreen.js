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
  Animated,
  Image,
} from "react-native";
import React, { useState, memo, useCallback, useEffect, useRef } from "react";
import { Colors, Sizes } from "../../constant/styles";
import { StyleSheet } from "react-native";
import AppText from "../../component/AppText";
import AppButton from "../../component/AppButton";
import AppHeader from "../../component/AppHeader";
import ArrowBack from "../../component/ArrowBack";
import PaymentMethod from "../../component/payment/PaymentMethod";
import {
  CECKOUT_WEBVIEW_SCREEN,
  CHECkOUT_COUNTRY,
  CURRENCY,
  STCCHECKOUT,
  TABBYCHECKOUT,
} from "../../navigation/routes";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import Dialog from "react-native-dialog";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useDispatch, useSelector } from "react-redux";
import initiatePayment from "../../utils/Payment/Initate";
import {
  calculateTotalWithTax,
  fetchZipCode,
  getZipCode,
} from "../../utils/Payment/helpers";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getUserByPhoneNumber, updateUserData } from "../../../utils/user";
import {
  setUserData,
  userRegisterSuccess,
} from "../../store/features/userSlice";
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
import { LinearGradient } from "expo-linear-gradient";
import { color } from "@rneui/base";
import { addNewCreditRequest } from "../../../utils/creditrequests"; // 👈 إضافة هذا

const { width, height } = Dimensions.get("screen");

export default function WalletScreen() {
  const { t } = useTranslation();
  const [loading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [state, setState] = useState({
    currentPaymentMethodIndex: 1,
    showSuccessDialog: false,
  });
  const user = useSelector((state) => state?.user?.userData);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [modalVisible, setShowModalVisible] = useState(false);
  const [requestPaymentModal, setRequestPaymentModal] = useState(false);
  const [amount, setAmmount] = useState(0);
  const updateState = (data) => setState((state) => ({ ...state, ...data }));
  const { currentPaymentMethodIndex, showSuccessDialog } = state;

  // Enhanced entrance animation with pulse
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for request button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Polling for wallet updates
  useEffect(() => {
    let interval;
    if (user?.attributes?.phoneNumber) {
      interval = setInterval(() => {
        getUserByPhoneNumber(user.attributes.phoneNumber)
          .then((updatedUser) => {
            if (
              updatedUser?.attributes?.wallet_amount !==
              user?.attributes?.wallet_amount
            ) {
              dispatch(setUserData(updatedUser));
            }
          })
          .catch((err) => console.log("Error polling user data:", err));
      }, 10000);
    }

    return () => clearInterval(interval);
  }, [
    dispatch,
    user?.attributes?.phoneNumber,
    user?.attributes?.wallet_amount,
  ]);

  const multiPaymentArray = [
    require("../../assets/images/payment_icon/visa.png"),
    require("../../assets/images/payment_icon/master.png"),
    require("../../assets/images/payment_icon/mada.png"),
  ];

  const handleRequestPayment = async () => {
    // 🔹 أولًا: ردة فعل لحظية (فتح المودال مؤقتًا)
    setRequestPaymentModal(true);

    // 🔹 بعدها: تنفيذ الطلب في الخلفية بدون تأخير للمستخدم
    try {
      const response = await fetch(
        `https://admin.njik.sa/api/credit-requests?filters[provider][id][$eq]=${user.id}&sort[0]=createdAt:desc&pagination[page]=1&pagination[pageSize]=1`
      );
      const data = await response.json();

      if (data?.data?.length > 0) {
        const lastRequest = data.data[0];
        const lastRequestDate = new Date(lastRequest.attributes.createdAt);
        const now = new Date();
        const diffDays = (now - lastRequestDate) / (1000 * 60 * 60 * 24);

        if (diffDays < 7) {
          // 🔹 نغلق المودال لو فيه طلب حديث
          setRequestPaymentModal(false);

          Alert.alert(
            t("Error"),
            t("You can only request balance once every 7 days")
          );
          return;
        }
      }

      // 🔹 ما نسوي شيء هنا لأن المودال مفتوح فعلاً
    } catch (error) {
      console.log("Error fetching credit requests:", error);
      setRequestPaymentModal(false);
      Alert.alert(t("Error"), t("Something went wrong, please try again."));
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ArrowBack subPage={true} custom={"Account"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Premium Balance Card */}
        <Animated.View
          style={[
            styles.balanceCardWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              Colors.primaryColor,
              Colors.primaryColor, // repeat to increase dominance
              "#ae00ffff",
              Colors.primaryColor,
            ]}
            locations={[0, 0.4, 0.75, 1]} // control color spread
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            {/* Decorative Elements */}
            <View style={styles.cardPattern}>
              <View style={styles.patternCircle1} />
              <View style={styles.patternCircle2} />
              <View style={styles.patternCircle3} />
              <View style={styles.patternLine1} />
              <View style={styles.patternLine2} />
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* User name at top */}
              <View style={{ marginBottom: 10 }}>
                <AppText
                  text={user?.attributes?.name || t("User")}
                  style={[styles.userName, { textAlign: "center" }]}
                />
              </View>

              {/* Balance and Wallet icon below */}
              <View style={styles.cardHeader}>
                <View style={styles.leftSection}>
                  <View style={styles.iconBadge}>
                    <MaterialCommunityIcons
                      name="wallet"
                      size={28}
                      color={Colors.whiteColor}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <AppText
                      text={t("Available Balance")}
                      style={styles.cardLabel}
                      centered={false}
                    />
                  </View>
                </View>

                {/* Request Payment Button */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={styles.requestButton}
                    onPress={handleRequestPayment}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.3)",
                        "rgba(255,255,255,0.2)",
                      ]}
                      style={styles.requestButtonGradient}
                    >
                      <MaterialCommunityIcons
                        name="bank-transfer-in"
                        size={20}
                        color={Colors.whiteColor}
                      />
                      <AppText
                        text={t("request_credit")}
                        style={styles.requestButtonText}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={styles.balanceDisplay}>
                <View style={styles.amountRow}>
                  <AppText
                    text={`${user?.attributes?.wallet_amount || 0}`}
                    style={styles.mainAmount}
                  />
                  <AppText text={t("CURRENCY")} style={styles.currencyText} />
                </View>
                <View style={styles.cardChip}>
                  <MaterialCommunityIcons
                    name="credit-card-chip-outline"
                    size={28}
                    color="rgba(255,255,255,0.9)"
                  />
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStatsRow}>
                <View style={styles.statItem}>
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                  />
                  <AppText text={t("Active")} style={styles.statText} />
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={16}
                    color="rgba(255,255,255,0.8)"
                  />
                  <AppText text={t("Verified")} style={styles.statText} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Payment Section */}
        <Animated.View
          style={[
            styles.paymentSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionIconWrapper}>
              <LinearGradient
                colors={[
                  Colors.primaryColor + "25",
                  Colors.primaryColor + "15",
                ]}
                style={styles.sectionIconGradient}
              >
                <FontAwesome5
                  name="credit-card"
                  size={24}
                  color={Colors.primaryColor}
                />
              </LinearGradient>
            </View>
            <View style={styles.sectionTextContainer}>
              <AppText
                text={t("Payment Method")}
                style={styles.sectionTitle}
                centered={false}
              />
              <AppText
                text={t("Select your preferred options")}
                style={styles.sectionSubtitle}
                centered={false}
              />
            </View>
          </View>

          <View style={styles.paymentMethodsWrapper}>
            <View style={styles.centeredPaymentContainer}>
              <MultiPaymentMethod
                icons={multiPaymentArray}
                paymentType="Card"
                index={1}
                updateState={updateState}
                currentPaymentMethodIndex={currentPaymentMethodIndex}
              />

              {Platform.OS === "ios" && (
                <View style={styles.centeredPaymentItem}>
                  <PaymentMethod
                    icon={require("../../assets/images/payment_icon/apple.png")}
                    paymentType="Card"
                    index={4}
                    updateState={updateState}
                    currentPaymentMethodIndex={currentPaymentMethodIndex}
                  />
                </View>
              )}

              <View style={styles.centeredPaymentItem}>
                <PaymentMethod
                  icon={require("../../assets/images/payment_icon/stc.png")}
                  paymentType="Card"
                  index={2}
                  updateState={updateState}
                  currentPaymentMethodIndex={currentPaymentMethodIndex}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            disabled={!currentPaymentMethodIndex}
            onPress={() => setShowModalVisible(true)}
            style={[
              styles.primaryButton,
              !currentPaymentMethodIndex && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                currentPaymentMethodIndex
                  ? [
                      Colors.primaryColor,
                      Colors.primaryColor, // repeat to increase dominance
                      "#ae00ffff",
                      Colors.primaryColor,
                    ]
                  : ["#CBD5E0", "#A0AEC0"]
              }
              locations={[0, 0.4, 0.75, 1]} // control color spread
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <MaterialCommunityIcons
                name="wallet-plus"
                size={24}
                color={Colors.whiteColor}
              />
              <AppText
                text={t("Continue to Charge")}
                style={styles.primaryButtonText}
              />
              <Ionicons
                name="arrow-forward"
                size={22}
                color={Colors.whiteColor}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <HandleGetAmountComponentModal
          visible={modalVisible}
          updateState={updateState}
          currentPaymentMethodIndex={currentPaymentMethodIndex}
          // onPress={() => handleModalDismiss()}
          setVisible={setShowModalVisible}
          setIsLoading={setIsLoading}
        />

        <RequestPaymentModal
          visible={requestPaymentModal}
          setVisible={setRequestPaymentModal}
          user={user}
        />

        <LoadingModal visible={loading} />
        <SuccessModel
          visible={showSuccessDialog}
          onPress={() => updateState({ showSuccessDialog: false })}
        />
      </ScrollView>
    </View>
  );
}

// Request Payment Modal Component
const RequestPaymentModal = memo(({ visible, setVisible, user }) => {
  const { t } = useTranslation();
  const [requestAmount, setRequestAmount] = useState("");
  const [iban, setIban] = useState("");
  const [maxRequestable, setMaxRequestable] = useState(0);
  const [isEditing, setIsEditing] = useState(false); // 👈 للتحكم في وضع التحرير
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      const wallet = Number(user?.attributes?.wallet_amount || 0);
      const activation = Number(user?.attributes?.activation || 0);

      const diff = wallet > activation ? wallet - activation : 0;
      setMaxRequestable(diff);

      if (diff > 0) {
        setRequestAmount(diff.toFixed(2));
      } else {
        setRequestAmount("");
      }

      // 👇 التحقق من وجود IBAN في قاعدة البيانات
      const savedIban = user?.attributes?.iban || user?.attributes?.ipan;
      if (savedIban && savedIban !== "null" && savedIban.trim() !== "") {
        // إذا فيه آيبان محفوظ، نحطه في الحقل ونقفل التعديل
        setIban(savedIban.replace(/^SA/i, "")); // يحذف SA عشان المستخدم يشوف الرقم فقط
        setIsEditing(false);
      } else {
        // ما فيه آيبان محفوظ، نخلي المستخدم يكتبه
        setIban("");
        setIsEditing(true);
      }
    }
  }, [visible, user]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAmountChange = (text) => {
    const value = text.replace(/[^0-9]/g, "");
    setRequestAmount(value);
  };

  const handleRequestPayment = async () => {
    if (!requestAmount || !iban) {
      Alert.alert(t("Error"), t("Please fill all required fields"));
      return;
    }

    if (iban.length !== 22) {
      Alert.alert(t("Error"), t("The IBAN number must be exactly 22 digits"));
      return;
    }

    if (Number(requestAmount) > maxRequestable) {
      Alert.alert(
        t("Error"),
        t("You can only request up to", {
          amount: maxRequestable.toFixed(2),
          currency: t("CURRENCY"),
        })
      );
      return;
    }

    if (
      Number(user?.attributes?.wallet_amount) <=
      Number(user?.attributes?.activation)
    ) {
      Alert.alert(
        t("Error"),
        t(
          "You cannot request balance because your wallet is below the minimum limit"
        )
      );
      return;
    }

    try {
      if (isEditing || !user?.attributes?.iban) {
        const formattedIban = iban.trim().startsWith("SA")
          ? iban.trim()
          : `SA${iban.trim()}`;
        const res = await updateUserData(user.id, { iban: formattedIban });

        console.log("✅ Final provider data after update:", res);
      }

      await addNewCreditRequest(
        { amount_requested: Number(requestAmount) },
        user.id
      );

      Alert.alert(
        t("Request Sent"),
        t("your_request_for_amount_sent", {
          amount: requestAmount,
          currency: t("CURRENCY"),
        }),
        [
          {
            text: t("OK"),
            onPress: () => {
              setVisible(false);
              setRequestAmount("");
              setIban("");
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error submitting credit request:", error);
      Alert.alert(t("Error"), t("Something went wrong, please try again."));
    }
  };

  return (
    <Dialog.Container
      visible={visible}
      onBackdropPress={() => setVisible(false)}
      contentStyle={{
        borderRadius: 32,
        paddingVertical: 0,
        paddingHorizontal: 0,
        backgroundColor: "transparent",
        width: width * 0.92,
        maxWidth: 450,
        overflow: "hidden",
      }}
      blurComponent={null}
    >
      <Animated.View
        style={{
          opacity: modalFadeAnim,
          transform: [{ scale: modalScaleAnim }],
        }}
      >
        <View
          style={{
            backgroundColor: Colors.whiteColor,
            borderRadius: 32,
            paddingVertical: 0,
            paddingBottom: 20,
            paddingHorizontal: 0,
            marginHorizontal: 0,
            marginVertical: 0,
            marginTop: -37,
            paddingTop: 0,
            overflow: "hidden",
          }}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={[
              Colors.primaryColor,
              Colors.primaryColor, // repeat to increase dominance
              "#ae00ffff",
              Colors.primaryColor,
            ]}
            locations={[0, 0.4, 0.75, 1]} // control color spread
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 32,
              paddingHorizontal: 28,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.4)",
              }}
            >
              <MaterialCommunityIcons
                name="bank-transfer-in"
                size={40}
                color={Colors.whiteColor}
              />
            </View>
            <AppText
              text={t("Request Balance")}
              style={{
                fontSize: RFPercentage(3),
                fontWeight: "900",
                color: Colors.whiteColor,
                marginBottom: 6,
              }}
              centered
            />
            <AppText
              text={t("Fill in your details below to continue")}
              style={{
                fontSize: RFPercentage(1.8),
                fontWeight: "600",
                color: "rgba(255,255,255,0.9)",
              }}
              centered
            />
          </LinearGradient>

          {/* Form Content */}
          <View style={{ padding: 28 }}>
            {/* Amount Input */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color={Colors.primaryColor}
                />
                <AppText
                  text={t("Amount")}
                  style={{
                    fontSize: RFPercentage(2),
                    fontWeight: "700",
                    color: "#2D3748",
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 2.5,
                  borderColor: requestAmount ? Colors.primaryColor : "#E2E8F0",
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  backgroundColor: "#F7FAFC",
                }}
              >
                <TextInput
                  keyboardType="numeric"
                  value={requestAmount}
                  onChangeText={handleAmountChange}
                  placeholder={`Max ${maxRequestable.toFixed(2)}`}
                  placeholderTextColor="#A0AEC0"
                  style={{
                    flex: 1,
                    fontSize: RFPercentage(2.8),
                    textAlign: "center",
                    color: Colors.primaryColor,
                    fontWeight: "800",
                  }}
                />

                <View
                  style={{
                    backgroundColor: "transparent",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                  }}
                >
                  <AppText
                    text={t("CURRENCY")}
                    style={{
                      color: Colors.primaryColor,
                      fontSize: RFPercentage(1.8),
                      fontWeight: "700",
                    }}
                  />
                </View>
              </View>
            </View>

            {/* IBAN Input */}
            <View style={{ marginBottom: 28 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="bank"
                  size={20}
                  color={Colors.primaryColor}
                />
                <AppText
                  text={t("IBAN Number")}
                  style={{
                    fontSize: RFPercentage(2),
                    fontWeight: "700",
                    color: "#2D3748",
                  }}
                />
                {!isEditing && (
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <AppText
                      text={t("Change")}
                      style={{
                        color: Colors.primaryColor,
                        fontSize: RFPercentage(1.8),
                        fontWeight: "700",
                        marginLeft: 10,
                      }}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 2.5,
                  borderColor: iban ? Colors.primaryColor : "#E2E8F0",
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  backgroundColor: isEditing ? "#F7FAFC" : "#F1F5F9",
                  direction: "ltr", // 👈 يخليها يسار إلى يمين
                }}
              >
                {/* "SA" ثابتة في اليسار */}
                <AppText
                  text="SA"
                  style={{
                    fontSize: RFPercentage(2.2),
                    fontWeight: "800",
                    color: Colors.primaryColor,
                    marginRight: 8,
                  }}
                />

                {/* المستخدم يكتب الباقي */}
                <TextInput
                  keyboardType="numeric"
                  value={iban}
                  editable={isEditing}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, "");
                    setIban(cleaned);
                  }}
                  placeholder="xxxxxxxxxxxxxxxxxxxx"
                  placeholderTextColor="#A0AEC0"
                  style={{
                    flex: 1,
                    fontSize: RFPercentage(2),
                    color: isEditing ? Colors.primaryColor : "#4A5568",
                    textAlign: "left",
                    fontWeight: "700",
                    writingDirection: "ltr",
                  }}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View
              style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
            >
              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                  setRequestAmount("");
                  setIban("");
                }}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  borderWidth: 2.5,
                  borderColor: "#E2E8F0",
                  paddingVertical: 16,
                  alignItems: "center",
                  backgroundColor: "#F7FAFC",
                }}
              >
                <AppText
                  text={t("Cancel")}
                  style={{
                    color: "#718096",
                    fontSize: RFPercentage(2.1),
                    fontWeight: "800",
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={
                  !requestAmount ||
                  !iban ||
                  Number(requestAmount) <= 0 ||
                  Number(requestAmount) > maxRequestable ||
                  Number(user?.attributes?.wallet_amount) <=
                    Number(user?.attributes?.activation)
                }
                onPress={handleRequestPayment}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  overflow: "hidden",
                  opacity:
                    !requestAmount ||
                    !iban ||
                    Number(requestAmount) <= 0 ||
                    Number(requestAmount) > maxRequestable ||
                    Number(user?.attributes?.wallet_amount) <=
                      Number(user?.attributes?.activation)
                      ? 0.5
                      : 1,
                }}
              >
                <LinearGradient
                  colors={[Colors.primaryColor, "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 16,
                  }}
                >
                  <AppText
                    text={t("Confirm")}
                    style={{
                      color: Colors.whiteColor,
                      fontSize: RFPercentage(2.1),
                      fontWeight: "800",
                    }}
                  />
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.whiteColor}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </Dialog.Container>
  );
});
const HandleGetAmountComponentModal = memo(
  ({
    visible,
    setVisible,
    setIsLoading,
    updateState,
    currentPaymentMethodIndex,
  }) => {
    const { t } = useTranslation();
    const [amount, setAmmount] = useState("");
    const dispatch = useDispatch();
    const user = useSelector((state) => state?.user?.userData);
    const navigation = useNavigation();
    const { language } = useLanguageContext();

    const TEST_PHONES = new Set([
      "966566901540",
      "966511111111",
      "966522222222",
      "966500064849",
      "966565685614",
    ]);
    const normalizedPhone = String(user?.attributes?.phoneNumber || "").replace(
      /\D/g,
      ""
    );
    const isTestUser = TEST_PHONES.has(normalizedPhone);
    const MIN_AMOUNT = isTestUser ? 1 : 50;

    useEffect(() => {
      if (visible) {
        setAmmount("");
      }
    }, [visible]);

    const handleSetAmount = (text) => {
      if (/^\d*$/.test(text)) setAmmount(text);
    };

    const handlePayOrder = async () => {
      if (!user) return;

      try {
        const res = await updateUserData(user.id, {
          wallet_amount:
            Number(user?.attributes?.wallet_amount) + Number(amount),
        });

        if (res) {
          const updatedUser = await getUserByPhoneNumber(
            user?.attributes?.phoneNumber
          );
          if (updatedUser) dispatch(setUserData(updatedUser));

          sendPushNotification(
            user?.attributes?.expoPushNotificationToken,
            `${t("Wallet charged successfully with")} ${amount} ${t(
              "CURRENCY"
            )} 🎉`,
            "",
            "user",
            user?.id,
            false
          );

          updateState({ showSuccessDialog: true });
        } else {
          Alert.alert(t("A problem occurred, try again."));
        }
      } catch (err) {
        console.log("Error updating user:", err.message);
      }
    };

    const handleGenererateInitator = (amount) => {
      setIsLoading(true);
      const orderAmmount = Number(amount);
      const uniqueId = Math.random().toString(36).substring(2, 15);

      const username = user?.attributes?.name.trim();
      const [firstName, ...rest] = username?.split(" ");
      const lastName = rest.join(" ");

      const orderDetails = {
        orderId: `CHARGE_${uniqueId}`,
        amount: orderAmmount.toFixed(2),
        currency: CURRENCY,
        description: `Charge Wallet with ${Number(amount).toFixed(2)}`,
        payerFirstName: firstName,
        payerLastName: lastName,
        payerEmail: user?.attributes?.email,
        payerPhone: user?.attributes?.phoneNumber,
        payerCity: user?.attributes?.city,
        payerAddress: user?.attributes?.googleMapLocation?.readable,
        payerCountry: CHECkOUT_COUNTRY,
      };

      setVisible(false);
      setAmmount(null);

      initiatePayment(orderDetails)
        .then((response) => {
          navigation.navigate(CECKOUT_WEBVIEW_SCREEN, {
            url: response?.redirect_url,
            orderId: `CHARGE_${uniqueId}`,
            handlePayOrderFun: handlePayOrder,
          });
        })
        .catch((error) => console.error("Error generating payment:", error))
        .finally(() => {
          setIsLoading(false);
          setAmmount(null);
        });
    };

    const handleTabbyPayment = async (amount) => {
      setIsLoading(true);
      const orderAmmount = Number(amount);
      const uniqueId = Math.random().toString(36).substring(2, 15);

      const username = user?.attributes?.name.trim();
      const [firstName, ...rest] = username?.split(" ");
      const lastName = rest.join(" ");

      const orderDetails = {
        amount: orderAmmount.toFixed(2),
        email: user?.email,
        phone: user?.phoneNumber,
        name: `${firstName} ${lastName}`,
        reference_id: `CHARGE_${uniqueId}`,
        city: user?.city,
        address: user?.location,
      };

      setVisible(false);
      setAmmount(null);

      try {
        const paymentUrl = await initiateTabbyPayment(orderDetails, language);
        navigation.navigate(TABBYCHECKOUT, {
          url: paymentUrl?.webUrl,
          sessionId: paymentUrl?.sessionId,
          orderId: `CHARGE_${uniqueId}`,
          handlePayOrderFun: handlePayOrder,
        });
      } catch (error) {
        console.log("Error initiating Tabby payment:", error);
      } finally {
        setIsLoading(false);
        setAmmount(null);
      }
    };

    const handleSTcPaymentInitate = async (amount) => {
      try {
        const phone = user?.attributes?.phoneNumber;
        setIsLoading(true);
        setVisible(false);
        const response = await handleAuthorizePayment(amount, phone, t);
        if (response?.OtpReference) {
          navigation.navigate(STCCHECKOUT, {
            RefNum: response?.RefNum,
            BillNumber: response?.BillNumber,
            OtpReference: response?.OtpReference,
            STCPayPmtReference: response?.STCPayPmtReference,
            handlePayOrderFun: handlePayOrder,
            amount: response?.amount,
          });
        }
      } catch (error) {
        console.log("Error generating STC payment:", error);
      } finally {
        setAmmount("");
        setIsLoading(false);
      }
    };

    return (
      <Dialog.Container
        visible={visible}
        onBackdropPress={() => {
          setVisible(false);
          setAmmount(null);
        }}
        contentStyle={{
          borderRadius: 20,
          padding: 20,
          alignItems: "center",
          backgroundColor: Colors.whiteColor,
        }}
      >
        <AppText
          text={t("Enter Charge Amount")}
          style={{
            fontSize: RFPercentage(2.5),
            marginBottom: 15,
            color: Colors.primaryColor,
          }}
          centered
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <TextInput
            keyboardType="numeric"
            value={amount}
            onChangeText={handleSetAmount}
            placeholder="0"
            style={{
              borderWidth: 2,
              borderColor: Colors.primaryColor,
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 30,
              textAlign: "center",
              fontSize: RFPercentage(2.8),
              color: Colors.primaryColor,
              minWidth: 130,
            }}
          />
        </View>
        <AppButton
          title={t("Confirm")}
          disabled={!amount || Number(amount) < MIN_AMOUNT}
          style={{
            width: width * 0.5,
            opacity: !amount || Number(amount) < MIN_AMOUNT ? 0.6 : 1,
          }}
          onPress={() =>
            currentPaymentMethodIndex === 3
              ? handleTabbyPayment(amount)
              : currentPaymentMethodIndex === 2
              ? handleSTcPaymentInitate(amount)
              : handleGenererateInitator(amount)
          }
        />
      </Dialog.Container>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7FAFC",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Balance Card Styles
  balanceCardWrapper: {
    marginHorizontal: width * 0.05,
    marginTop: 24,
    marginBottom: 28,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 16,
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  gradientCard: {
    padding: 22,
    minHeight: 170,
    position: "relative",
  },
  cardPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  patternCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  patternCircle3: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  patternLine1: {
    display: "none",
  },
  patternLine2: {
    display: "none",
  },
  cardContent: {
    zIndex: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: RFValue(12),
    fontWeight: "600",
    marginBottom: 2,
  },
  userName: {
    color: Colors.whiteColor,
    fontSize: RFValue(15),
    fontWeight: "700",
  },
  requestButton: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 0,
      },
    }),
  },

  requestButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  requestButtonText: {
    color: Colors.whiteColor,
    fontSize: RFValue(12),
    fontWeight: "700",
  },
  balanceDisplay: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  mainAmount: {
    color: Colors.whiteColor,
    fontSize: RFPercentage(5.5),
    fontWeight: "900",
    letterSpacing: 1,
  },
  currencyText: {
    color: Colors.whiteColor,
    fontSize: RFPercentage(2.5),
    fontWeight: "700",
    opacity: 0.95,
  },
  cardChip: {
    display: "none",
  },
  quickStatsRow: {
    display: "none",
  },
  statItem: {
    display: "none",
  },
  statText: {
    display: "none",
  },
  statDivider: {
    display: "none",
  },

  // Payment Section Styles
  paymentSection: {
    backgroundColor: Colors.whiteColor,
    marginHorizontal: width * 0.05,
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 28,
  },
  sectionIconWrapper: {
    borderRadius: 18,
    overflow: "hidden",
  },
  sectionIconGradient: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.blackColor,
    fontSize: RFValue(19),
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#718096",
    fontSize: RFValue(13),
    fontWeight: "600",
  },
  paymentMethodsWrapper: {
    marginBottom: 28,
  },
  centeredPaymentContainer: {
    alignItems: "center",
    gap: 16,
  },
  centeredPaymentItem: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    borderRadius: 18,
    overflow: "hidden",
    elevation: 6,
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  primaryButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 28,
  },
  primaryButtonText: {
    color: Colors.whiteColor,
    fontSize: RFPercentage(2.4),
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalContainer: {
    borderRadius: 32,
    width: width * 0.92,
    maxWidth: 420,
    padding: 0,
    backgroundColor: Colors.whiteColor,
    maxHeight: height * 0.85,
  },
  modalContent: {
    padding: 32,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  modalIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  modalMainTitle: {
    color: Colors.blackColor,
    fontSize: RFPercentage(3.2),
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    color: "#718096",
    fontSize: RFPercentage(2),
    fontWeight: "600",
    textAlign: "center",
  },

  // Amount Input Styles
  amountInputSection: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.primaryColor,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 28,
    backgroundColor: `${Colors.primaryColor}08`,
    gap: 14,
  },
  mainInput: {
    fontSize: RFPercentage(5),
    color: Colors.primaryColor,
    fontWeight: "900",
    textAlign: "center",
    minWidth: 130,
    padding: 0,
  },
  currencyBadge: {
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  currencyBadgeText: {
    color: Colors.whiteColor,
    fontSize: RFPercentage(2.1),
    fontWeight: "800",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 18,
  },
  errorMessage: {
    color: "#E53E3E",
    fontSize: RFPercentage(1.9),
    fontWeight: "600",
  },

  // Quick Select Styles
  quickSelectSection: {
    marginBottom: 32,
  },
  quickSelectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  quickSelectTitle: {
    color: "#2D3748",
    fontSize: RFPercentage(2.2),
    fontWeight: "800",
  },
  quickAmountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
  },
  quickAmountCard: {
    width: (width * 0.92 - 64 - 42) / 2,
    minWidth: 145,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#E2E8F0",
    backgroundColor: "#F7FAFC",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  quickAmountCardActive: {
    borderColor: Colors.primaryColor,
    backgroundColor: `${Colors.primaryColor}12`,
    elevation: 8,
    shadowColor: Colors.primaryColor,
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  selectedBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: Colors.whiteColor,
    borderRadius: 14,
    padding: 3,
    elevation: 6,
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  quickAmountValue: {
    color: "#2D3748",
    fontSize: RFPercentage(3.2),
    fontWeight: "900",
    marginBottom: 4,
  },
  quickAmountValueActive: {
    color: Colors.primaryColor,
  },
  quickAmountCurrency: {
    color: "#718096",
    fontSize: RFPercentage(1.8),
    fontWeight: "700",
  },
  quickAmountCurrencyActive: {
    color: Colors.primaryColor,
  },

  // Confirm Button Styles
  confirmButtonContainer: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  confirmButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
    opacity: 0.5,
  },
  confirmButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 22,
    paddingHorizontal: 36,
  },
  confirmButtonText: {
    color: Colors.whiteColor,
    fontSize: RFPercentage(2.5),
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // Request Payment Modal Styles
  requestModalContainer: {
    borderRadius: 32,
    width: width * 0.92,
    maxWidth: 420,
    padding: 0,
    backgroundColor: Colors.whiteColor,
    maxHeight: height * 0.9,
  },
  requestModalContent: {
    padding: 32,
  },
  requestModalHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  requestModalIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  requestModalTitle: {
    color: Colors.blackColor,
    fontSize: RFPercentage(3.2),
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  requestModalSubtitle: {
    color: "#718096",
    fontSize: RFPercentage(2),
    fontWeight: "600",
    textAlign: "center",
  },
  requestFormContainer: {
    marginBottom: 28,
    gap: 20,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    color: "#2D3748",
    fontSize: RFPercentage(2),
    fontWeight: "700",
    marginLeft: 4,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F7FAFC",
  },
  requestInput: {
    flex: 1,
    fontSize: RFPercentage(2.8),
    color: Colors.primaryColor,
    fontWeight: "800",
    padding: 0,
  },
  inputCurrency: {
    color: Colors.primaryColor,
    fontSize: RFPercentage(2),
    fontWeight: "700",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F7FAFC",
  },
  phoneInput: {
    flex: 1,
    fontSize: RFPercentage(2.2),
    color: "#2D3748",
    fontWeight: "600",
    padding: 0,
  },
  noteInputContainer: {
    borderWidth: 2.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F7FAFC",
  },
  noteInput: {
    fontSize: RFPercentage(2),
    color: "#2D3748",
    fontWeight: "600",
    minHeight: 80,
    textAlignVertical: "top",
  },
  requestButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: "#E2E8F0",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7FAFC",
  },
  cancelButtonText: {
    color: "#718096",
    fontSize: RFPercentage(2.1),
    fontWeight: "800",
  },
  sendRequestButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sendRequestGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  sendRequestText: {
    color: Colors.whiteColor,
    fontSize: RFPercentage(2.1),
    fontWeight: "800",
  },
});
