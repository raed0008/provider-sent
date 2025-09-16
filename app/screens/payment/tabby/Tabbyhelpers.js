import { updateOrderData } from "../../../../utils/orders";
import { getUserByPhoneNumber, updateProviderData, updateUserData } from "../../../../utils/user";
import { setUserData } from "../../../store/features/userSlice";
import { calculateProviderProfitAfterPayment } from "../../../utils/Payment/helpers";
import axios from 'axios';

export const HandleUserBalanceAfterOperation = async (orderId,decreadedAmountFromWallet,user,dispatch) => {
    try {
        const orderIdMatch = orderId.match(/ORDER(\d+)/);

        if (orderIdMatch && orderIdMatch[1]) {
            const OrderCurrentID = orderIdMatch[1];
            console.log("order id is yahhh", OrderCurrentID)
            const walletDiscount = decreadedAmountFromWallet
            if (walletDiscount > 0) {
                const value = Number(user?.wallet_amount) - Number(walletDiscount)
                const res = await updateUserData(user?.id, {
                    wallet_amount: value?.toFixed(2)
                })
                await updateOrderData(OrderCurrentID, {
                    payed_amount_with_wallet: Number(walletDiscount),
                    //   paymentO
                })
                console.log('the user wallet will be contain after this operation ',value)
                if (res) {
                    console.log("Success Update User", res)
                    const gottenuser = await getUserByPhoneNumber(user?.phoneNumber);

                    dispatch(setUserData(gottenuser));
                    //   Alert.alert("  تمت عمليةالشحن بنجاح ")

                }
            }
        }
    } catch (err) {
        console.log("err handle oeration",err)
    }
}

export const HandleProviderProfitAfterSuccessPayment = async (CurrentOrderData,sendPushNotification) => {
    try {
        if (CurrentOrderData?.id) {
            const amount = calculateProviderProfitAfterPayment(CurrentOrderData)
            const providerCurrentWalletAmount = CurrentOrderData?.attributes?.provider?.data?.attributes?.wallet_amount
            const FinalAmount = Number(amount) + Number(providerCurrentWalletAmount)
            await updateProviderData(CurrentOrderData?.attributes?.provider?.data?.id, {
                wallet_amount: FinalAmount.toFixed(2)
            })
            await sendPushNotification(CurrentOrderData?.attributes?.provider?.data?.attributes?.expoPushNotificationToken, 
                "استلام دفع 💰💰", 
                `تم استلام دفع طلب من ${CurrentOrderData?.attributes?.user?.data?.attributes?.username}`)
            console.log('tHandleProviderProfitAfterSuccessPayment',{
                amount,providerCurrentWalletAmount
            })
        }
    } catch (err) {
        console.log("HandleProviderProfitAfterSuccessPayment", err)
    }
}



// const TABBY_API_URL = 'https://api.tabby.ai/api/v2/checkout/';

// export const getTabbyPaymentUrl = async (id) => {
//   try {
//     const response = await axios.get(`${TABBY_API_URL}${'900fc6fb-844f-44c6-ae03-39b3888183f6'}`, {
//       headers: {
//         Authorization: `Bearer pk_test_54d11c07-6553-4287-ab74-da4048c78faf`,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (response?.data && response?.data?.api_url) {
//         console.log('the sessions from get tappp',response?.data?.api_url)
//       return response?.data?.api_url;
//     }
//   } catch (error) {
//     console.log('Failed to fetch Tabby payment URL:', error);
//   }
// };



