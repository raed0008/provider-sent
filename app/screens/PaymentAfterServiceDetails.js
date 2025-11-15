import {
  View,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";
import AppText from "../component/AppText";
import { Colors } from "../constant/styles";
import ArrowBack from "../component/ArrowBack";
import { CURRENCY, HOME } from "../navigation/routes";
import AppButton from "../component/AppButton";
import OtherReasonModal from "../component/OtherReasonModal";
import { CommonActions } from "@react-navigation/native";

import AppModal from "../component/AppModal";
import useNotifications from "../../utils/notifications";
import LoadingScreen from "./loading/LoadingScreen";
import ChooseSparePartsOnly from "../component/payment/ChooseExtraOrSpare.jsx/ChooseSparePartsOnly";
import {
  getAdditionalPriceSum,
  handleConfirmAddPrice,
} from "../utils/Payment/PaymentAfterServicehelpers";
import { fetchSingleCategory } from "../../utils/categories";
import { requestPayment } from "../../utils/orders";
import {
  getServicesOrders,
  addServiceOrder,
  deleteServiceOrder,
} from "../../utils/services_order";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("screen");

const TAX_RATE = 0.15;

const getPriceWithTax = (price) => {
  const base = Number(price) || 0;
  return Math.round(base * (1 + TAX_RATE));
};

// helper function
const findOtherService = (services) => {
  return services.find(
    (s) =>
      s?.attributes?.name_en?.toLowerCase()?.includes("other") ||
      s?.attributes?.name_en?.toLowerCase()?.includes("another")
  );
};

export default function PaymentAfterServiceDetails({ route, navigation }) {
  const [AddedAmount, setAddedAmount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // Remove additionalAmounts state, keep only spareParts
  const [spareParts, setSpareParts] = useState({ amount: null, billImage: "" });
  const [servicesList, setServicesList] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [tempSelectedService, setTempSelectedService] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const alertText = t("alert");
  const successText = t("success");
  const failText = t("fail");
  const [servicesOrders, setServicesOrders] = useState([]);
  // الخدمات اللي انضافت أو انحذفت مؤقتًا
  const [pendingServices, setPendingServices] = useState([]);
  const [hiddenCartIds, setHiddenCartIds] = useState([]);
  const [showOtherReason, setShowOtherReason] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [otherPrice, setOtherPrice] = useState(0);
  const { sendPushNotification } = useNotifications();
  // const orders = useSelector((state) => state?.orders?.orders);
  const { item: order } = route?.params;

  const [AdditionalAmountIDs, setAddionalAmountIds] = useState([]);
  const [spare_partsIds, setSparePartsIds] = useState([]);
  const provider = useSelector((state) => state?.user?.userData);
  const [isManualFee, setIsManualFee] = useState(false);

  const handleAmountChange = (text) => {
    const parsedAmount = Number(text);
    if (!isNaN(parsedAmount) && parsedAmount >= 0) {
      setAddedAmount(parsedAmount);
      setIsManualFee(true);
    } else {
      setAddedAmount(null);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const carts = order?.attributes?.service_carts?.data || [];
        if (carts.length === 0) return;

        const firstService = carts[0]?.attributes?.service?.data;
        const categoryId = firstService?.attributes?.category?.data?.id;
        if (!categoryId) return;

        const category = await fetchSingleCategory(categoryId);
        const services = category?.attributes?.services?.data || [];
        setServicesList(services);
      } catch (error) {
        console.log("Error fetching services", error);
      }
    };

    const loadServicesOrders = async () => {
      try {
        const res = await getServicesOrders(order.id);
        // إذا طلع عندك res.data أو res.data.data استخدمها هنا
        setServicesOrders(res?.data || res);
      } catch (error) {
        console.log("❌ Error loading services orders", error);
      }
    };

    fetchServices();
    loadServicesOrders();
  }, []);

  // useEffect(() => {
  //   try {
  //     const baseServices = order?.attributes?.service_carts?.data
  //       ?.filter(cart => !hiddenCartIds.includes(cart.id))
  //       ?.map(cart => Number(cart?.attributes?.service?.data?.attributes?.Price) || 0) || [];

  //     const extraServices = servicesOrders.map(
  //       s => Number(s?.attributes?.price) || Number(s?.attributes?.service?.data?.attributes?.Price) || 0
  //     );

  //     const pendingAddServices = pendingServices
  //       .filter(p => p.type === "add")
  //       .map(p => Number(p.data.price) || 0);

  //     const total = [...baseServices, ...extraServices, ...pendingAddServices]
  //       .reduce((acc, val) => acc + val, 0);

  //     if (!isManualFee) {
  //       setAddedAmount(total);
  //     }
  //   } catch (err) {
  //     console.log("Error calculating technician fee", err);
  //   }
  // }, [servicesOrders, order, hiddenCartIds, pendingServices]);

  const handleAddServicePress = () => {
    if (servicesList.length === 0) {
      // حتى لو فاضي لازم نفتح المودال عشان "أخرى"
      setServicesList([
        { id: "other", attributes: { name_ar: "أخرى", Price: 0 } },
      ]);
    }
    setDropdownVisible(true);
  };

  const handleConfirmService = async () => {
    if (!tempSelectedService) {
      Toast.show({
        type: "info",
        text1: alertText,
        text2: t("choose_service_first"),
      });
      return;
    }

    const serviceName =
      tempSelectedService?.attributes?.name_en?.toLowerCase() || "";
    const servicePrice = Number(tempSelectedService?.attributes?.Price) || 0;

    if (
      serviceName.includes("other") ||
      serviceName.includes("another") ||
      servicePrice === 0
    ) {
      setShowOtherReason(true);
      return;
    }

    setPendingServices((prev) => [
      ...prev,
      {
        type: "add",
        data: {
          orderId: order.id,
          serviceId: tempSelectedService.id,
          price: servicePrice,
          quantity: 1,
          explain: null,
        },
      },
    ]);

    Toast.show({
      type: "success",
      text1: successText,
      text2: t("success_add_service"),
    });
    setDropdownVisible(false);
    setTempSelectedService(null);
  };

  const handleConfirmOtherReason = async () => {
    setPendingServices((prev) => [
      ...prev,
      {
        type: "add",
        data: {
          orderId: order.id,
          serviceId: tempSelectedService.id,
          price: 0, 
          quantity: 1,
          explain: otherReason, 
        },
      },
    ]);

    Toast.show({
      type: "success",
      text1: successText,
      text2: t("success_add_service"),
    });
    setDropdownVisible(false);
    setShowOtherReason(false);
    setTempSelectedService(null);
    setOtherReason("");
  };

  const handleDeleteService = (serviceOrderId) => {
    Alert.alert(t("delete_service"), t("do_you_want_to_delete_this_service"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          setPendingServices((prev) => [
            ...prev,
            { type: "delete", id: serviceOrderId },
          ]);
          Toast.show({
            type: "info",
            text1: alertText,
            text2: t("deleted_service"),
          });
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;
  const totalServicesCount =
    (order?.attributes?.service_carts?.data?.filter(
      (cart) => !hiddenCartIds.includes(cart.id)
    )?.length || 0) +
    (servicesOrders?.length || 0) +
    (pendingServices.filter((p) => p.type === "add").length || 0);

  const isValidSpareParts = (spareParts) => {
    if (!spareParts) return true; // يعني ما أضاف قطع غيار، ما في مشكلة
    const hasAmount = spareParts?.amount && Number(spareParts.amount) > 0;
    const hasImage = spareParts?.billImage && spareParts.billImage.trim() !== "";
    return hasAmount && hasImage;
  };

  const handleRequestPayment = async (id) => {
    try {
      setLoading(true);
      const res = await requestPayment(id); 
      console.log("🟡 Current navigation state:", navigation.getState());
      console.log(
        "🟡 Parent navigation state:",
        navigation.getParent()?.getState()
      );
      if (res) {
        Alert.alert(t("Done successfully"), "", [{ text: t("Ok") }]);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "App",
              state: {
                routes: [{ name: HOME }],
              },
            },
          ],
        });
      } else {
        Alert.alert(t("A problem occurred, try again."), "", [
          { text: t("Ok") },
        ]);
      }
    } catch (error) {
      console.log("❌ error requested payment", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="ondrag"
        style={{
          height: height * 1,
          backgroundColor: Colors.whiteColor,
        }}
      >
        <ArrowBack />
        <View style={styles.container2}>
          {/* عنوان القائمة */}
          <AppText
            text={t("added_services")} 
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: Colors.blackColor,
              marginBottom: 10,
              marginLeft: 0,
            }}
          />

          {/* قائمة الخدمات */}
          <View style={{ paddingHorizontal: 18 }}>
            {/* قائمة الخدمات من الباك اند */}
            {servicesOrders.map((serviceOrder) => {
              const price = Number(serviceOrder?.attributes?.price) || 0;

              return (
                <View key={serviceOrder.id} style={styles.serviceCard}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.serviceName,
                        {
                          textAlign: i18n.language === "ar" ? "right" : "left",
                        },
                      ]}
                    >
                      {i18n.language === "en"
                        ? serviceOrder?.attributes?.service?.data?.attributes
                            ?.name_en
                        : serviceOrder?.attributes?.service?.data?.attributes
                            ?.name_ar}
                    </Text>

                    <AppText
                      centered={false}
                      style={[
                        styles.servicePrice,
                        { flexShrink: 1, marginLeft: 4 },
                      ]}
                      text={`${getPriceWithTax(price)} ${t(CURRENCY)}`}
                    />
                  </View>
                  <MaterialIcons
                    name="delete"
                    size={22}
                    color={Colors.redColor}
                  />
                </View>
              );
            })}

            {/* الخدمات المضافة مؤقتًا */}
            {pendingServices
              .filter((p) => p.type === "add")
              .map((p, index) => {
                const service = servicesList.find(
                  (s) => s.id === p.data.serviceId
                );
                const price = Number(p.data.price) || 0;

                return (
                  <View key={`pending-${index}`} style={styles.serviceCard}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection:
                          i18n.language === "ar" ? "row" : "row-reverse", 
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* السعر */}
                      {price > 0 && (
                        <Text style={styles.servicePrice}>
                          {getPriceWithTax(price)} {t(CURRENCY)}
                        </Text>
                      )}

                      {/* اسم الخدمة */}
                      <Text style={styles.serviceName}>
                        {i18n.language === "en"
                          ? service?.attributes?.name_en
                          : service?.attributes?.name_ar || "خدمة جديدة"}
                      </Text>
                    </View>

                    {/* زر الحذف */}
                    <TouchableOpacity
                      onPress={() => {
                        if (totalServicesCount > 1) {
                          setPendingServices((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        } else {
                          Toast.show({
                            type: "info",
                            text1: alertText,
                            text2: t("must_remain_one_service"),
                            position: "top",
                          });
                        }
                      }}
                    >
                      <MaterialIcons
                        name="delete"
                        size={22}
                        color={Colors.redColor}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}

            {/* عرض الخدمات الأصلية من carts */}
            {order?.attributes?.service_carts?.data
              ?.filter((cart) => !hiddenCartIds.includes(cart.id))
              .map((cart, index) => (
                <View key={`cart-${index}`} style={styles.serviceCard}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection:
                        i18n.language === "ar" ? "row" : "row-reverse",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.serviceName}>
                      {i18n.language === "en"
                        ? cart?.attributes?.service?.data?.attributes?.name_en
                        : cart?.attributes?.service?.data?.attributes
                            ?.name_ar || "Service Name"}
                    </Text>

                    <Text style={styles.servicePrice}>
                      {getPriceWithTax(
                        cart?.attributes?.service?.data?.attributes?.Price
                      ) || 0}{" "}
                      {t(CURRENCY)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (totalServicesCount > 1) {
                        Alert.alert(
                          t("delete_service"),
                          t("do_you_want_to_delete_this_service"),
                          [
                            { text: t("Cancel"), style: "cancel" },
                            {
                              text: t("delete"),
                              style: "destructive",
                              onPress: () => {
                                setHiddenCartIds((prev) => [...prev, cart.id]);
                              },
                            },
                          ]
                        );
                      } else {
                        Toast.show({
                          type: "info",
                          text1: alertText,
                          text2: t("must_remain_one_service"),
                          position: "top",
                        });
                      }
                    }}
                  >
                    <MaterialIcons
                      name="delete"
                      size={22}
                      color={Colors.redColor}
                    />
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* زر إضافة خدمة */}
          <TouchableOpacity
            onPress={handleAddServicePress}
            style={{
              marginTop: -5,
              paddingHorizontal: 18,
              alignSelf: "flex-start",
            }}
          >
            <AppText
              text={t("add_service_+")}
              style={{
                fontSize: 16,
                color: Colors.blueColor,
                fontWeight: "600",
                textDecorationLine: "underline",
              }}
            />
          </TouchableOpacity>

          {/* 👇 بعده يجي حقل أجرة الفني */}
          <View
            style={[
              styles.amountContainer,
              {
                paddingHorizontal: 18,
              },
            ]}
          >
            <AppText
              text={"technician fee"}
              centered={true}
              style={styles.amountText}
            />
            <TextInput
              keyboardType="numeric"
              selectionColor={Colors.blueColor}
              value={
                isManualFee
                  ? AddedAmount?.toString() || "" // يدوي → خام
                  : getPriceWithTax(AddedAmount)?.toString() || "" 
              }
              onChangeText={(text) => handleAmountChange(text)}
              style={styles.input}
            />
          </View>

          <View>
            <ChooseSparePartsOnly
              setSpareParts={setSpareParts}
              spareParts={spareParts}
            />
          </View>
        </View>
      </ScrollView>
      <AppModal
        message={
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
              marginLeft: -20,
              width: width,
            }}
          >
            <AppText text={`Total Price`} />
            <AppText
              text={
                isManualFee
                  ? getAdditionalPriceSum(spareParts, AddedAmount) || 0 
                  : getPriceWithTax(
                      getAdditionalPriceSum(spareParts, AddedAmount) || 0
                    )
              }
            />
            <AppText text={` ${t(CURRENCY)}`} />
          </View>
        }
        setModalVisible={setShowModal}
        isModalVisible={showModal}
        onPress={async () => {
          try {
            setLoading(true);

            // 1) حفظ قطع الغيار + الأسعار
            await handleConfirmAddPrice(
              setShowModal,
              setLoading,
              [],
              () => {},
              spareParts,
              order?.id,
              order,
              sendPushNotification,
              navigation,
              setAddionalAmountIds,
              setSparePartsIds,
              AddedAmount,
              provider,
              t,
              spare_partsIds,
              AdditionalAmountIDs
            );

            for (const p of pendingServices.filter((p) => p.type === "add")) {
              const saved = await addServiceOrder({
                orderId: order.id,
                serviceId: p.data.serviceId,
                price: p.data.price,
                quantity: p.data.quantity,
                explain: p.data.explain,
              });
              setServicesOrders((prev) => [...prev, saved]);
            }
              
              Toast.show({
                type: "success",
                text1: successText,
                text2: t("data_saved_successfully"),
              });
          } catch (err) {
            console.log("❌ Error in final confirm:", err);
            Toast.show({
              type: "error",
              text1: failText,
              text2: t("data_save_failed"),
            });
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* المودال الخاص بالدروب داون */}
      <AppModal
        isModalVisible={dropdownVisible}
        setModalVisible={setDropdownVisible}
        message={
          <ScrollView
            style={{ maxHeight: height * 0.7 }} 
            contentContainerStyle={{
              paddingBottom: 100, 
            }}
            showsVerticalScrollIndicator={false}
          >
            <AppText
              text={t("اختر الخدمة")}
              style={{ textAlign: "center", fontSize: 18, marginBottom: 10 }}
            />

            {[...servicesList]
              .sort((a, b) => {
                const aName = a?.attributes?.name_en?.toLowerCase() || "";
                const bName = b?.attributes?.name_en?.toLowerCase() || "";
                const aIsOther =
                  aName.includes("other") || aName.includes("another");
                const bIsOther =
                  bName.includes("other") || bName.includes("another");
                if (aIsOther && !bIsOther) return 1;
                if (!aIsOther && bIsOther) return -1;
                return 0;
              })
              .map((service) => {
                const attrs = service?.attributes || {};
                const isSelected = tempSelectedService?.id === service.id;
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isSelected ? Colors.primaryColor : "#ccc",
                      marginBottom: 8,
                      backgroundColor: isSelected ? Colors.piege : "white",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={() => setTempSelectedService(service)}
                  >
                    <Text style={{ fontSize: 15, flex: 1 }}>
                      {i18n.language === "en" ? attrs?.name_en : attrs?.name_ar}
                    </Text>
                    <Text
                      style={{
                        marginLeft: 10,
                        color: isSelected
                          ? Colors.blackColor
                          : Colors.primaryColor,
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      {getPriceWithTax(attrs?.Price)} {t(CURRENCY)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        }
        onPress={handleConfirmService}
      />

      {/* زر إنهاء العمل وطلب الدفع */}
      {!AddedAmount && (
        <View
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: Colors.whiteColor,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppButton
            title={"Finish Work and Request Payment"}
            style={{
              backgroundColor: Colors.success,
              paddingHorizontal: 40,
              paddingVertical: 15,
              borderRadius: 15,
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#fff",
            }}
            onPress={() => {
              if (order?.attributes?.totalPrice > 0) {
                handleRequestPayment(order?.id);
              } else {
                Toast.show({
                  type: "error",
                  text1: alertText,
                  text2: t("please_add_base_price_first"),
                  position: "top",
                });
              }
            }}
          />
        </View>
      )}

      {/* زر استمرار */}
      {AddedAmount !== null &&
        AddedAmount !== "" &&
        Number(AddedAmount) > 0 && (
          <View
            style={{
              paddingVertical: 20,
              paddingHorizontal: 20,
              backgroundColor: Colors.whiteColor,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AppButton
              title={"Continue"}
              disabled={!isValidSpareParts(spareParts)}
              style={{
                backgroundColor: isValidSpareParts(spareParts)
                  ? Colors.primaryColor
                  : Colors.grayColor,
                paddingHorizontal: 50,
                paddingVertical: 15,
                borderRadius: 15,
              }}
              textStyle={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#fff",
              }}
              onPress={() => {
                if (isValidSpareParts(spareParts)) {
                  setShowModal(true);
                } else {
                  Toast.show({
                    type: "error",
                    text1: failText,
                    text2: t("please_complete_spare_parts"),
                    position: "top",
                  });
                }
              }}
            />
          </View>
        )}

      <OtherReasonModal
        visible={showOtherReason}
        value={otherReason}
        setValue={setOtherReason}
        price={otherPrice}
        setPrice={setOtherPrice}
        onClose={() => setShowOtherReason(false)}
        onConfirm={handleConfirmOtherReason}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: Colors.whiteColor,
  },
  header: {
    textAlign: "center",
  },
  name: {
    fontSize: 17,
    color: Colors.blackColor,
  },
  amountContainer: {
    paddingTop: 18,
    display: "flex",
    backgroundColor: "red",
    marginHorizontal: 30,
    alignItems: "center",
    // justifyContent:'center',
    flexDirection: "row",
    gap: 10,
  },
  AdditionalAmmountsContainer: {
    paddingTop: 18,
    display: "flex",
    flexDirection: "column",
    marginHorizontal: 30,
    alignItems: "center",
    // justifyContent:'center',
    gap: 10,
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
    width: width * 0.95,
    padding: 10,
    // borderWidth: 0.7,
    borderRadius: 10,
    marginHorizontal: 8,
    backgroundColor: Colors.whiteColor,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 4,
    gap: 10,
  },
  descriptionContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "auto",
    width: width * 0.9,
    padding: 10,
    // borderWidth: 0.7,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: Colors.whiteColor,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 4,
    gap: 10,
  },
  descriptionContainer2: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "auto",
    width: width * 0.99,
    padding: 10,
    // paddingHorizontal:20,
    // borderWidth: 0.7,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: Colors.whiteColor,

    gap: 10,
  },
  serviceCard: {
    backgroundColor: "#f9f9f9", // لون فاتح
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primaryColor,
  },

  servicePrice: {
    fontSize: 12,
    marginTop: 3,
    flexShrink: 1,
    flexWrap: "wrap",
    color: Colors.primaryColor,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.redColor,
    borderRadius: 8,
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.primaryColor,
    borderRadius: 8,
  },
  price: {
    fontSize: 17,
    color: Colors.primaryColor,
    marginTop: 5,
    fontWeight: 700,
  },
  title: {
    fontSize: 21,
    color: Colors.primaryColor,
  },
  itemContainer2: {
    display: "flex",
    flex: 2,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  increaseButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 40,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 5.0,
    marginTop: 4.0,
    borderRadius: 40,
    backgroundColor: Colors.primaryColor,
  },
  buttonText: {
    color: Colors.whiteColor,
  },
  amountText: {
    paddingHorizontal: 10,
    color: Colors.blackColor,
    // paddingTop:10
  },
  input: {
    color: Colors.blueColor,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 35,
    paddingVertical: 5,
    marginTop: -1,
    fontSize: 18,
    width: "auto",
    borderColor: Colors.blueColor,
  },
  TextinputStyle: {
    color: Colors.blackColor,
    borderWidth: 1,
    width: width * 0.9,
    paddingHorizontal: 10,
    marginTop: 1,
    paddingVertical: 10,
    fontSize: 18,
    borderColor: Colors.blueColor,
    borderRadius: 10,
    marginHorizontal: 20,
    alignSelf: "center",
    display: "flex",
  },
  amountContainer: {
    paddingTop: 18,
    display: "flex",
    alignItems: "center",
    // justifyContent:'center',
    flexDirection: "row",
    gap: 5,
  },
  container2: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  container3: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    borderWidth: 1,
    width: width * 0.9,
    borderRadius: 10,
    padding: 10,
  },
  additionalAmountContainer: {
    display: "flex",
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
});
