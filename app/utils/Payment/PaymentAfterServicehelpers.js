import { CommonActions, useNavigation } from "@react-navigation/native";
import { UpdateOrder, getOrderById } from "../../../utils/orders";
import { HOME, MY_ORDERS } from "../../navigation/routes";
import { Alert } from "react-native";
import {
  CreateAdditionalPrice,
  CreateSparePart,
} from "../../../utils/AddionalOrderPrice";
import { getUserAttributesById } from "../../../utils/user";

export const getAdditionalPriceSum = (spareParts, AddedAmount) => {
  const sparePartsAmount = spareParts?.amount ? Number(spareParts.amount) : 0;
  return sparePartsAmount + (Number(AddedAmount) || 0);
};

const handleGetTotalPrice = (
  additionalAmounts,
  spareParts,
  AddedAmount,
  currentPrice
) => {
  const value =
    additionalAmounts?.length > 0
      ? getAdditionalPriceSum(additionalAmounts, AddedAmount)
      : getAdditionalPriceSum(spareParts, AddedAmount);
  console.log(
    "the value forx the get tootl price is ",
    value + Number(currentPrice)
  );
  return value + Number(currentPrice);
};
export const handleConfirmAddPrice = async (
  setShowModal,
  setLoading,
  additionalAmounts,
  setAdditionalAmounts,
  spareParts,
  orderID,
  selectedOrder,
  sendPushNotification,
  navigation,
  setAddionalAmountIds,
  setSparePartsIds,
  AddedAmount,
  provider,
  t,
  spare_partsIds,
  AdditionalAmountIDs
) => {
  try {
    setShowModal(false);
    setLoading(true);
    console.log("the function is PAY_AFTER_SERVICES_SCREEN");

    const orderResponse = await getOrderById(orderID);
    console.log(
      "🧩 Spare parts from Strapi:",
      orderResponse?.attributes?.spare_parts?.data
    );
    const existingSpareParts =
      orderResponse?.attributes?.spare_parts?.data || [];

    console.log("🔍 Existing Spare Parts Count:", existingSpareParts.length);
    console.log(
      "🔍 Existing Spare Parts:",
      existingSpareParts.map((s) => s.id)
    );

    if (existingSpareParts.length > 0) {
      console.log("🚫 Order already has spare parts! Blocking creation...");
      Alert.alert(
        t("Attention"),
        t(
          "This order already has spare parts added. You cannot add another one"
        ),
        [
          {
            text: t("Go to Orders"),
            onPress: () => navigation.goBack(),
          },
        ]
      );
      setLoading(false);
      return;
    }

    if (existingSpareParts.length > 0) {
      Alert.alert(
        t("Attention"),
        t(
          "This order already has spare parts added. You cannot add another one."
        ),
        [
          {
            text: t("Go to Orders"),
            onPress: () => navigation.goBack(),
          },
          { text: t("Cancel"), style: "cancel" },
        ]
      );
      setLoading(false);
      return;
    }

    const additionalAmountIds = [];
    const sparePartsIds = [];

    if (additionalAmounts?.length > 0) {
      await Promise.all(
        additionalAmounts.map(async (item) => {
          const id = await CreateAdditionalPriceAndGetId(
            item,
            setAddionalAmountIds,
            "additional"
          );
          additionalAmountIds.push(id);
        })
      );
    }

    if (spareParts) {
      if (sparePartsIds.length > 0) {
        console.log(
          "⚠️ Spare part already created in this session, skipping..."
        );
        return;
      }

      const id = await CreateAdditionalPriceAndGetId(
        spareParts,
        setSparePartsIds,
        "SpareParts"
      );
      sparePartsIds.push(id);
    }

    // 🔍 نجيب بيانات المستخدم من Strapi
    const userId = selectedOrder?.attributes?.user?.data?.id;
    const userAttributes = await getUserAttributesById(userId);
    console.log("📦 userAttributes:", userAttributes);
    const userAppVersion = userAttributes?.App_version;

    console.log("📱 user app_version:", userAppVersion);

    // 👇 نحسب قطع الغيار
    const sparePartsTotal = spareParts ? Number(spareParts?.amount || 0) : 0;

    const TAX_RATE = 0.15;
    const providerFeeWithTax = Number(AddedAmount) || 0;
    const providerFeeWithoutTax = providerFeeWithTax / (1 + TAX_RATE);

    let totalPrice = providerFeeWithoutTax;

    // ✅ إذا كان الإصدار <= 4.0.2 أو null نضيف قطع الغيار
    if (!userAppVersion || compareVersions(userAppVersion, "4.0.2") <= 0) {
      totalPrice += sparePartsTotal;
      console.log("✅ Added spare parts to totalPrice:", totalPrice);
    } else {
      console.log("🚫 New version, spare parts not added");
    }

    console.log("🧩 connecting sparePartsIds:", sparePartsIds);

    const res = await UpdateOrder(orderID, {
      provider_fee: null,
      totalPrice: totalPrice,
      additional_prices: {
        connect: additionalAmountIds.length > 0 ? additionalAmountIds : [],
      },
      spare_parts:
        sparePartsIds.length > 0 ? { connect: sparePartsIds } : undefined,
      status: "payment_required",
      provider_payment_status: "payment_required",
      addtional_prices_state: "pending",
    });

    console.log("the id of the spare parts is ", sparePartsIds);

    const userNotificationToken =
      selectedOrder?.attributes?.user?.data?.attributes
        ?.expoPushNotificationToken;

    if (res) {
      let user = selectedOrder?.attributes?.user?.data;
      sendPushNotification(
        userNotificationToken,
        ` قام ${provider?.attributes?.name}  بانهاء العمل علي الطلب و طلب الدفع`,
        "",
        "user",
        user?.id,
        true
      );
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: t(HOME) }],
        })
      );
      navigation.goBack();
      Alert.alert(t("Done successfully"), "", [{ text: t("Ok") }]);
    } else {
      Alert.alert(t("A problem occurred, try again."), "", [{ text: t("Ok") }]);
    }
  } catch (error) {
    console.log("error creating additional order", error);
  } finally {
    setLoading(false);
    setAdditionalAmounts([]);
  }
};

export const CreateAdditionalPriceAndGetId = async (item, setIds, type) => {
  try {
    let response;
    if (type === "SpareParts") {
      console.log("spare type creating orders", type, {
        price: Number(item?.amount),
        details: item?.description,
        bill_image: item?.billImage,
      });
      response = await CreateSparePart({
        price: Number(item?.amount),
        details: item?.description,
        bill_image: item?.billImage,
      });
      setIds((prevIds) => [...prevIds, response?.data?.id]);
    } else if (type === "additional") {
      console.log("additional type creating orders", type);
      response = await CreateAdditionalPrice({
        Price: Number(item.amount),
        details: item?.description,
      });
      setIds((prevIds) => [...prevIds, response?.data?.id]);
    }
    return response?.data?.id;
  } catch (error) {
    console.log("error creating additional order", error);
  }
};

// 🧩 مقارنة بين رقمين مثل 4.0.2 و 4.1.0
const compareVersions = (v1, v2) => {
  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const a = v1Parts[i] || 0;
    const b = v2Parts[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
};
