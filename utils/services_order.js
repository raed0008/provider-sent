// utils/services_orders.js
import api from "./index";

//  جلب الخدمات المرتبطة بطلب معيّن
export const getServicesOrders = async (orderId) => {
  try {
    if (!orderId) return [];

    const response = await api.get(
      `/api/services-orders?filters[order][id][$eq]=${orderId}&populate=service,order`
    );
    return response?.data?.data || [];
  } catch (error) {
    console.log("❌ Error fetching services orders:", error.response?.data || error.message);
    return [];
  }
};





export const addServiceOrder = async ({ orderId, serviceId, quantity = 1, price = 0, explain = null }) => {
    try {
        const response = await api.post(`/api/services-orders?populate=service,order`, {
            data: {
                order: orderId,
                service: serviceId,
                quantity,
                price: Number(price) || 0,
                explain,
            },
        });
        return response.data.data;
    } catch (error) {
        console.log("❌ Error adding service order:", error.response?.data || error.message);
        throw error;
    }
};





// 🟠 تحديث خدمة داخل الطلب
export const updateServiceOrder = async (id, data) => {
    try {
        const response = await api.put(`/api/services-orders/${id}`, {
            data: {
                ...data,
            },
        });
        return response?.data?.data;
    } catch (error) {
        console.log("Error updating service order:", error.message);
        return null;
    }
};

// 🟠 حذف خدمة من الطلب
export const deleteServiceOrder = async (id) => {
    try {
        await api.delete(`/api/services-orders/${id}`);
        return id;
    } catch (error) {
        console.log("Error deleting service order:", error.message);
        return null;
    }
};
