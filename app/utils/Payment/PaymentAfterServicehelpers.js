import { CommonActions } from "@react-navigation/native";
import { UpdateOrder } from "../../../utils/orders";
import { HOME } from "../../navigation/routes";
import { Alert } from "react-native";
import { CreateAdditionalPrice, CreateSparePart } from "../../../utils/AddionalOrderPrice";

export const getAdditionalPriceSum = (amountArray, AddedAmount) => {
  const amounts = amountArray?.map((item) => item?.amount);
  const sum = amounts?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return Number(sum) + Number(AddedAmount) || Number(AddedAmount);
};

const handleGetTotalPrice = (additionalAmounts, spareParts, AddedAmount, currentPrice) => {
  const value = additionalAmounts?.length > 0 ? getAdditionalPriceSum(additionalAmounts, AddedAmount) : getAdditionalPriceSum(spareParts, AddedAmount)
  console.log('the value forx the get tootl price is ', value + Number(currentPrice))
  return value + Number(currentPrice)
}
export const handleConfirmAddPrice = async (
  setShowModal, setLoading, additionalAmounts, setAdditionalAmounts, spareParts, orderID, selectedOrder, sendPushNotification, navigation, setAddionalAmountIds, setSparePartsIds, AddedAmount, provider, t, spare_partsIds, AdditionalAmountIDs
) => {
  try {
    setShowModal(false);
    setLoading(true);
    console.log('the function is PAY_AFTER_SERVICES_SCREEN')
    const additionalAmountIds = [];
    const sparePartsIds = [];

    if (additionalAmounts?.length > 0) {
      await Promise.all(additionalAmounts.map(async (item) => {
        const id = await CreateAdditionalPriceAndGetId(item, setAddionalAmountIds, 'additional');
        additionalAmountIds.push(id);
      }));
    }

    if (spareParts?.length > 0) {
      await Promise.all(spareParts.map(async (item) => {
        const id = await CreateAdditionalPriceAndGetId(item, setSparePartsIds, 'SpareParts');
        sparePartsIds.push(id);
      }));
    }

    // 👇 تعديل حساب المجموع بدون الضريبة
    const TAX_RATE = 0.15;
    // السعر اللي كتبه الفني (شامل الضريبة)
    const providerFeeWithTax = Number(AddedAmount) || 0;
    // نحسبه بدون الضريبة
    const providerFeeWithoutTax = providerFeeWithTax / (1 + TAX_RATE);
    // جمع أسعار قطع الغيار
    const spareSum = spareParts?.reduce((acc, part) => acc + (Number(part.amount) || 0), 0);
    // التوتل برايس = الأجرة بدون الضريبة + قطع الغيار
    const totalPrice = providerFeeWithoutTax + spareSum;

    const res = await UpdateOrder(orderID, {
      provider_fee: null, // 👈 دايم null
      totalPrice: totalPrice, // 👈 بدون الضريبة + قطع الغيار
      additional_prices: {
        connect: additionalAmountIds.length > 0 ? additionalAmountIds : [],
      },
      spare_parts: {
        connect: sparePartsIds.length > 0 ? sparePartsIds : [],
      },
      status: "payment_required",
      provider_payment_status: "payment_required",
      addtional_prices_state: "pending",
    });


    console.log('the id of the spare parts is ', sparePartsIds);

    const userNotificationToken = selectedOrder?.attributes?.user?.data?.attributes?.expoPushNotificationToken;
    // console.log('the order details now is ',handleGetTotalPrice(additionalAmounts,spareParts,AddedAmount,selectedOrder?.attributes?.totalPrice))
    if (res) {
      let user = selectedOrder?.attributes?.user?.data
      sendPushNotification(
        userNotificationToken,
        ` قام ${provider?.attributes?.name}  بانهاء العمل علي الطلب و طلب الدفع`, '', 'user', user?.id, true
      );
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: t(HOME) }],
        })
      );
      navigation.goBack()
      Alert.alert(t("Done successfully"), "", [{ text: t('Ok') }]);
    } else {
      Alert.alert(t('A problem occurred, try again.'), "", [{ text: t('Ok') }]);
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
    if (type === 'SpareParts') {
      console.log('spare type creating orders', type, {
        price: Number(item?.amount),
        details: item?.description,
        bill_image: item?.billImage,
      });
      response = await CreateSparePart({
        price: Number(item?.amount),
        details: item?.description,
        bill_image: item?.billImage,
      });
      setIds((prevIds) => [...prevIds, { id: response?.data?.id }]);
    } else if (type === 'additional') {
      console.log('additional type creating orders', type);
      response = await CreateAdditionalPrice({
        Price: Number(item.amount),
        details: item?.description,
      });
      setIds((prevIds) => [...prevIds, { id: response?.data?.id }]);
    }
    return response?.data?.id;
  } catch (error) {
    console.log("error creating additional order", error);
  }
};