import { Alert } from 'react-native';
import { directPaymentAuthorize, directPaymentConfirm } from './apiServices';
import Toast from 'react-native-toast-message';
import { FORCE_PAYMENT_SUCCESS } from "./config";

// Authorize Payment
export const handleAuthorizePayment = async (amount, phoneNumber, t) => {
  console.log("🔎 handleAuthorizePayment amount received:", amount, typeof amount);

  if (!amount || isNaN(Number(amount)) || !phoneNumber) {
    Toast.show({ type: 'error', text2: t("Please provide valid amount and phone number") });
    return null;
  }

  // Generate unique refs
  const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const uniqueRefNum = `Ref_${uniqueId}`;
  const uniqueBillNum = `Bill_${uniqueId}`;

  // test mode
  if (FORCE_PAYMENT_SUCCESS) {
    console.log("⚡ [STC Authorize] Forced Success Mode ON");
    return {
      RefNum: uniqueRefNum,
      BillNumber: uniqueBillNum,
      OtpReference: `OTP_${uniqueId}`,       // OTP test
      STCPayPmtReference: `PMT_${uniqueId}`, // Reference test
      amount: amount,
    };
  }

  const payload = {
    BranchID: `BranchId for ${uniqueBillNum}`,
    TellerID: `TellerID for ${uniqueBillNum}`,
    DeviceID: `DeviceID for ${uniqueBillNum}`,
    RefNum: uniqueRefNum,
    BillNumber: uniqueBillNum,
    Amount: amount?.toString(),
    MobileNo: phoneNumber,
  };

  console.log("🚀 [STC Authorize] Sending request with payload:", payload);

  try {
    const response = await directPaymentAuthorize(payload);
    console.log("✅ [STC Authorize] Response:", response);

    if (response) {
      return {
        RefNum: uniqueRefNum,
        BillNumber: uniqueBillNum,
        OtpReference: response?.OtpReference,
        STCPayPmtReference: response?.STCPayPmtReference,
        amount: amount,
      };
    }
  } catch (error) {
    console.error("❌ [STC Authorize] Error:", error?.response?.data || error);

    const errCode =
      String(
        error.response?.data?.error?.code ||
        error.response?.data?.Code ||
        ""
      );
    const errMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.Message ||
      "";

    if (errCode === "2003") {
      if (errMsg.toLowerCase().includes("maximum otp") || errMsg.toLowerCase().includes("exceeded")) {
        Toast.show({ type: 'error', text2: t("Too many OTP attempts. Try again after 15 minutes") });
      } else if (errMsg.toLowerCase().includes("pending request")) {
        Toast.show({ type: 'error', text2: t("You already have a pending payment request. Please complete or wait") });
      } else {
        Toast.show({ type: 'error', text2: errMsg || t("STC Bank Error") });
      }
    } else if (errCode === "401" || error.response?.data?.httpCode === "401") {
      Toast.show({ type: 'error', text2: t("Unauthorized request. Please check STC API credentials or security settings") });
    } else if (error.name === "TimeoutError") {
      Toast.show({ type: 'error', text2: t("Network Timeout. Please try again") });
    } else if (errMsg) {
      Toast.show({ type: 'error', text2: errMsg });
    } else {
      Toast.show({ type: 'error', text2: t("Something Went Wrong, Please try again") });
    }
    return null;
  }
};


// Confirm Payment
export const handleConfirmPayment = async (OtpReference, OtpValue, STCPayPmtReference, t) => {
  if (FORCE_PAYMENT_SUCCESS) {
    console.log("⚡ [STC Confirm] Forced Success Mode ON");
    return {
      ApprovalStatus: 2,
      Message: "Forced payment success (test mode)",
      OtpReference: OtpReference || "OTP_TEST",
      STCPayPmtReference: STCPayPmtReference || "PMT_TEST",
    };
  }

  const payload = {
    OtpReference: OtpReference?.toString(),
    OtpValue: OtpValue?.toString(),
    STCPayPmtReference: STCPayPmtReference?.toString(),
  };

  console.log("🚀 [STC Confirm] Sending request with payload:", payload);

  try {
    const response = await directPaymentConfirm(payload);
    console.log("✅ [STC Confirm] Response:", response);
    return response;
  } catch (error) {
    console.error("❌ [STC Confirm] Error:", error?.response?.data || error);

    const errCode = String(
      error.response?.data?.error?.code ||
      error.response?.data?.Code ||
      ""
    );
    const errMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.Message ||
      "";

    // Handle specific error codes with user-friendly messages
    switch (errCode) {
      case "2001":
        Toast.show({ type: "error", text2: t("Invalid Request Format") });
        break;
      case "2003":
        Toast.show({ type: "error", text2: t("Insufficient Balance or Business Validation Error") });
        break;
      case "2004":
        Toast.show({ type: "error", text2: t("No such merchant") });
        break;
      case "2006":
        Toast.show({ type: "error", text2: t("No Such Payment") });
        break;
      case "2008":
        Toast.show({ type: "error", text2: t("Customer Not Found") });
        break;
      case "2019":
        Toast.show({ type: "error", text2: t("Required OTP Reference") });
        break;
      case "2020":
        Toast.show({ type: "error", text2: t("Required OTP Value") });
        break;
      case "2021":
        Toast.show({ type: "error", text2: t("Required STC Payment Reference") });
        break;
      case "2027":
        Toast.show({ type: "error", text2: t("Payment Cancelled") });
        break;
      case "2028":
        Toast.show({ type: "error", text2: t("Please complete your Customer Information (KYC)") });
        break;
      case "2029":
        Toast.show({ type: "error", text2: t("Account status is not valid to perform this transaction") });
        break;
      case "2030":
        Toast.show({ type: "error", text2: t("Debit Account Restricted") });
        break;
      case "2034":
        Toast.show({ type: "error", text2: t("Merchant Not Activated") });
        break;
      case "2037":
        Toast.show({ type: "error", text2: t("OTP Reference mismatch with Payment") });
        break;
      case "2038":
        Toast.show({ type: "error", text2: t("Invalid OTP value") });
        break;
      case "2031":
        Toast.show({ type: "error", text2: t("Invalid OTP, please request a new one") });
        break;
      case "2009":
        Toast.show({ type: "error", text2: t("Payment Already Paid") });
        break;
      case "4012":
        Toast.show({ type: "error", text2: t("Customer rejected the payment") });
        break;
      case "4013":
        Toast.show({ type: "error", text2: t("Waiting for the customer to accept the payment") });
        break;
      case "E0001":
        Toast.show({ type: "error", text2: t("Invalid Message ID format") });
        break;
      case "E0006":
        Toast.show({ type: "error", text2: t("Service Code for merchant not found") });
        break;
      case "V0001":
        Toast.show({ type: "error", text2: t("Feature is not enabled") });
        break;
      case "V0003":
        Toast.show({ type: "error", text2: t("Client IP address not authorized") });
        break;
      default:
        Toast.show({ type: "error", text2: errMsg || t("Something Went Wrong, Please try again") });
    }
  }
};