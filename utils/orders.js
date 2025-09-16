import { useQuery } from "@tanstack/react-query";
// import api from './index';

import api from "./index";
import { useCallback } from "react";

// const api = axios.create({
//   baseURL: "http://192.168.1.5:1337",
//   headers: {
//     "Content-Type": "application/json",
//   }, // Set your base URL
// });

export const postOrder = async (values) => {
  try {
    const res = await axios.post("http://192.168.1.4:1337/api/orders", {
      data: {
        ...values,
      },
    });
    return res?.data?.data?.id ? res?.data?.data?.id : null;
  } catch (error) {
    console.error("Error:", error.message); // Log the error response
  }
};
export const delay_order_request = async (values) => {
  try {
    const data = await api.post(`/api/delay-requests`, {
      data: {
        ...values,
      },
    });
    return data?.data?.data || null
  } catch (error) {
    console.error("Error 22:", error.message); // Log the error response
  }
};

export const cancleOrder = async (id, providerId) => {
  try {
    const data = await api.put(`/api/orders/${id}`, {
      data: {
        provider: null,
        status: "pending",
        chat_channel_id: null,
        previous_providers: {
          connect: [{ id: providerId }]
        }
      },
    });
    if (data?.data?.data?.id) return true;
    return false;
  } catch (error) {
    console.error("Error accepting order   :", error.message); // Log the error response
  }
};

export const changeOrderStatus = async (id, status, extraData = {}) => {
  try {
    const data = await api.put(`/api/orders/${id}`, {
      data: {
        status: status,
        ...extraData,
      },
    });

    if (data?.data?.data?.id) return true;
    return false;
  } catch (error) {
    console.error("Error accepting order   :", error.message);
  }
};

export const requestPayment = async (id) => {
  try {
    const data = await api.put(`/api/orders/${id}`, {
      data: {
        status: "payment_required",
        provider_payment_status: "payment_required"
      },
    });
    if (data?.data?.data?.id) return true;
    return false;
  } catch (error) {
    console.error("Error accepting order   :", error.message); // Log the error response
  }
};
export const UpdateOrder = async (id, data) => {
  try {
    const res = await api.put(`/api/orders/${id}`, {
      data: {
        ...data
      },
    });
    return data, res?.data?.data?.id;

  } catch (error) {
    console.error("Error updaing order   :", error.message); // Log the error response
  }
};
export const acceptOrder = async (id, providerId, channel_id) => {
  try {
    const data = await api.put(`/api/orders/${id}`, {
      data: {
        provider: providerId,
        status: "assigned",
        chat_channel_id: channel_id,
      },
    });
    if (data?.data?.data?.id) return true;
    return false;
  } catch (error) {
    console.error("Error accepting order   :", error.message); // Log the error response
  }
};

export default function useOrders() {
  const fetchOrders = useCallback(async () => {
    try {
      let allOrders = [];
      let page = 1; // Start with the first page

      while (true) {
        const response = await api.get(`/api/orders?populate=deep,4&pagination[page]=${parseInt(page, 10)}`);

        // Assuming response.data is an array, proceed with adding to the allOrders array
        const currentPageOrders = response?.data?.data || [];
        allOrders = [...allOrders, ...currentPageOrders];

        // Check if there is a next page in the pagination information
        const nextPage = response?.data?.meta?.pagination.pageCount;

        if (nextPage === page || nextPage === 0) {
          break; // No more pages, exit the loop
        }

        // Move to the next page
        page++;
      }


      return {
        data: allOrders.reverse()
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      throw error;
    }
  }, [])


  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchIntervalInBackground: true,
    retry: 3, // Number of retry attempts if the request fails
    retryDelay: 1000, // Delay between retries in milliseconds
    staleTime: 5 * 60 * 1000, //
  })

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}
export function usePendingOrders() {
  const fetchOrders = useCallback(async () => {
    try {
      let allOrders = [];
      let page = 1; // Start with the first page

      while (true) {
        const response = await api.get(`/api/orders?filters[status][$eq]=pending?populate=deep,4&pagination[page]=${parseInt(page, 10)}`);

        // Assuming response.data is an array, proceed with adding to the allOrders array
        const currentPageOrders = response?.data?.data || [];
        allOrders = [...allOrders, ...currentPageOrders];

        // Check if there is a next page in the pagination information
        const nextPage = response?.data?.meta?.pagination.pageCount;

        if (nextPage === page || nextPage === 0) {
          break; // No more pages, exit the loop
        }

        // Move to the next page
        page++;
      }


      return {
        data: allOrders.reverse()
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      throw error;
    }
  }, [])


  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchIntervalInBackground: true,
    retry: 3, // Number of retry attempts if the request fails
    retryDelay: 1000, // Delay between retries in milliseconds
    staleTime: 5 * 60 * 1000, //
  })

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

export const GetProvidersOrders = async (userId) => {
  try {
    const res = await api.get(`/api/providers/${userId}?populate[orders][populate]=*`)
    // console.log('the response for this is ',res?.data?.data?.attributes?.orders?.data )
    if (res?.data?.data?.attributes?.orders?.data) return res?.data?.data?.attributes?.orders?.data
  } catch (error) {
    console.log('error getting the user order attached', error)
  }
}

export const GetOrderData = async (id) => {
  try {
    const data = await api.get(`/api/orders/${id}?populate=deep,4`);
    if (data?.data?.data) return data?.data?.data
    return null;
  } catch (error) {
    console.log("Error geting data order   :", error.message); // Log the error response
  }
};

export function useOrder(id) {
  const fetchOrders = async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}?populate=deep`);

      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["singleorder"],
    queryFn: () => getNearOrders(id),
    retry: 3, // Number of retry attempts if the request fails
    retryDelay: 1000, // Delay between retries in milliseconds
    staleTime: 5 * 60 * 1000, //

  }); // Changed the query key to 'superheroes'

  return {
    data,
    isLoading,
    isError,
  };
}

export const getNearOrders = async (providerId) => {
  try {
    const data = await api.get(`/api/providers/${providerId}?populate[nearbyOrders][filters][status][$eq]=pending`);
    if (data?.data?.data) {
      const nearOrders = data?.data?.data?.attributes?.nearbyOrders?.data?.reverse()
      return nearOrders
    } else {

      return null
    }
  } catch (error) {
    console.log("Error geting data order   :", error.message); // Log the error response
  }
};

export function useNearOrders(id) {

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["NearOrdersLocations", id],
    queryFn: () => getNearOrders(id),
    retry: 5, // Number of retry attempts if the request fails
    retryDelay: 1000, // Delay between retries in milliseconds
    staleTime: 1 * 60 * 1000, //

  }); // Changed the query key to 'superheroes'

  return {
    data: data,
    isLoading,
    isError,
    refetch
  };
}


export const getCurrentNearOrders = async (providerId, type) => {
  try {
    let filter = "";

    if (type === "all") {
      filter = "[filters][status][$ne]=pending";
    } else if (type === "current") {
      filter = "[filters][userOrderRating][$null]=true";
    } else if (type === "finished") {
      filter = "[filters][status][$eq]=finished"; // finished orders only
    } else {
      filter = "[filters][userOrderRating][$null]=false";
    }

    const data = await api.get(`/api/providers/${providerId}?populate[orders]${filter}`);
    if (data?.data?.data) {
      const Orders = data?.data?.data?.attributes?.orders?.data?.reverse()
      console.log("the get current order with type", type, Orders?.length);
      return Orders;
    }
    return null;
  } catch (error) {
    console.log("Error geting data order:", error);
  }
};

export const updateOrderData = async (id, orderData) => {
  try {
    const data = await api.put(`/api/orders/${id}`, {
      data: {
        ...orderData

      }
    });
    if (data?.data?.data?.id) return true
    return false;
  } catch (error) {
    console.log("Error updatingorder order   :", error.message); // Log the error response
  }
};

export function useCurrentOrders(id, type, refreshing) {

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["CurrentProvoiderOrders", type, refreshing],
    queryFn: () => getCurrentNearOrders(id, type),
    retry: 3, // Number of retry attempts if the request fails
    retryDelay: 1000, // Delay between retries in milliseconds
    staleTime: 5 * 60 * 1000, //

  }); // Changed the query key to 'superheroes'

  return {
    data,
    isLoading,
    isError,
    refetch
  };
}
export function useSingleOrder(id, refreshing) {

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["CurrentProvoiderOrders", id, refreshing],
    queryFn: () => GetOrderData(id),



  }); // Changed the query key to 'superheroes'

  return {
    data,
    isLoading,
    isError,
    refetch
  };
}