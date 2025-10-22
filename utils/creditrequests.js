import { useQuery } from "@tanstack/react-query";
import api from "./index";

/**
 * Hook to fetch all credit requests
 * Supports pagination and deep population
 */
export default function useCreditRequests(providerId) {
  const fetchCreditRequests = async () => {
    try {
      let allRequests = [];
      let page = 1;

      while (true) {
        const response = await api.get(
          `/api/credit-requests?populate=deep&pagination[page]=${page}&filters[provider][id][$eq]=${providerId}`
        );

        const currentPageData = response?.data?.data || [];
        allRequests = [...allRequests, ...currentPageData];

        const nextPage = response?.data?.meta?.pagination.pageCount;
        if (nextPage === page || nextPage === 0) break;
        page++;
      }

      return allRequests;
    } catch (error) {
      console.log("Error fetching credit requests:", error);
      throw error;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["creditRequests", providerId],
    queryFn: fetchCreditRequests,
    enabled: !!providerId, // runs only if providerId exists
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, isError, refetch };
}

/**
 * Create new credit request
 * @param {Object} values - object that contains { amount_requested }
 * @param {number} providerId - current provider ID
 */
export const addNewCreditRequest = async (values, providerId) => {
  try {
    const res = await api.post("/api/credit-requests", {
      data: {
        ...values,
        status: "pending",
        provider: {
          connect: [providerId],
        },
      },
    });

    return res?.data?.data;
  } catch (error) {
    console.log(
      "Error creating credit request:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Update credit request status (optional)
 * for admin usage (approve/reject)
 */
export const updateCreditRequestStatus = async (id, newStatus) => {
  try {
    const res = await api.put(`/api/credit-requests/${id}`, {
      data: { status: newStatus },
    });
    return res?.data?.data;
  } catch (error) {
    console.log(
      "Error updating credit request status:",
      error.response?.data || error.message
    );
    throw error;
  }
};
