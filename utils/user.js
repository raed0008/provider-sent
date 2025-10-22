import { setUserData } from "../app/store/features/userSlice";
import api from "./index";

export const createUser = async (data) => {
  try {
    const createdUser = await api.post("/api/providers", {
      data: {
        ...data,
      },
    });
    return createdUser;
  } catch (error) {
    console.log("Error creating the user ", error);
  }
};
export const getUserByPhoneNumber = async (phone) => {
  try {
    // Remove the "+" symbol
    // +201144254129
    if (phone) {
      const user = await api.get(
        `/api/providers?populate=*&filters[$and][0][phoneNumber][$eq]=` + phone
      );
      if (
        user?.data?.data[0]?.attributes &&
        user?.data?.data[0]?.attributes?.phoneNumber
      ) {
        setUserData(user?.data?.data);
        return user?.data?.data[0];
      } else {
        return null;
      }
    }
  } catch (error) {
    console.log("Error creating the user ", error.message);
  }
};
export const getUserCurrentOrders = async (id) => {
  try {
    if (id) {
      const user = await api.get(`/api/providers/${id}?populate=*`);
      return user?.data?.data?.attributes?.orders?.data;
    }
  } catch (error) {
    console.log("Error getting the user ", error.message);
  }
};
export const updateUserData = async (id, data) => {
  try {
    const updatedUser = await api.put(`/api/providers/${id}`, {
      data: {
        ...data,
      },
    });
    if (updatedUser?.data?.data) return true;
    return false;
  } catch (error) {
    console.log("error updating the user ", error.message);
  }
};
export const updateUserDataClient = async (id, data) => {
  try {
    const updatedUser = await api.put(`/api/users/${id}`, {
      ...data
    })
    if (updateUserData) return true
    return false
  } catch (error) {
    console.log('error updating the user ', error.message)
  }
}
export const getUserById = async (id) => {
  try {
    if (id) {

      const user = await api.get(`/api/users/${id}?populate=*`)
      return user?.data
    }
  } catch (error) {
    console.log("Error getting the user ", error.message)
  }
}
export const getProviderById = async (id) => {
  try {
    if (id) {
      const user = await api.get(`/api/providers/${id}?populate=*`);
      return user?.data?.data;
    }
  } catch (error) {
    console.log("Error getting the user ", error.message);
    return null;
  }
};


export const updateProviderData = async (id, data) => {
  try {
    console.log("🚀 updateProviderData CALLED with:", id, data);

    const updatedUser = await api.put(`/api/providers/${id}`, {
      data: {
        ...data,
      },
    });

    // console.log("🔄 Full API Response:", JSON.stringify(updatedUser?.data, null, 2));

    if (updatedUser?.data?.data) {
      return true;
    }
    return false;
  } catch (error) {
    console.log("❌ error updating the provider ", error.message);
  }
};

export const AddNewNotification = async (id, type, notification, store) => {
  try {
    if (!store) return;

    let data;
    if (type === 'provider') {
      data = await getProviderById(id);
      data = data?.data?.attributes
    } else {
      data = await getUserById(id);
    }

    if (!data) {
      console.log(`No data found for ${type} with id ${id}`);
      return;
    }

    const currentNotifications = data?.notifications || [];

    // console.log('the user and provider data fro mthis is ',data)
    const updatedNotifications = [...currentNotifications, notification];

    let res;
    if (type === 'provider') {
      res = await updateProviderData(id, { notifications: updatedNotifications });
    } else {
      res = await updateUserDataClient(id, { notifications: updatedNotifications });
    }

    if (res) {
      console.log('The result of updating the notifications:', res);
    }
  } catch (err) {
    console.log('Error adding new notification:', err);
  }
};

export const checkForceUpdate = async (id) => {
  try {
    const res = await api.get(`/api/providers/${id}?populate=*`);
    return res?.data?.data?.attributes;
  } catch (error) {
    console.log("Error checking force update:", error.message);
    return null;
  }
};

export const DeleteNotification = async (id, type, notificationId) => {
  try {
    let data;
    if (type === 'provider') {
      data = await getProviderById(id);
      // console.log('getting the provider data with id of', id, data?.data?.attributes?.notifications);
    } else {
      data = await getUserById(id);
    }

    if (!data) {
      console.log(`No data found for ${type} with id ${id}`);
      return;
    }

    const updatedNotifications = data?.data?.attributes?.notifications?.filter(
      notification => notification?.id !== notificationId
    );

    console.log('the updated notification length is ', data?.data?.attributes?.notifications[0], notificationId)

    let res;
    if (type === 'provider') {
      res = await updateProviderData(id, { notifications: updatedNotifications });
    } else {
      res = await updateUserDataClient(id, { notifications: updatedNotifications });
    }

    if (res) {
      console.log('The result of updating the notifications:', res);
    }
  } catch (err) {
    console.log('Error deleting notification:', err);
  }
};


