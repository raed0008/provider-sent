import { useQuery } from '@tanstack/react-query';
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.5:1337", // Set your base URL
});




 export default function useReviews() {
  const fetchReviews = async () => {
    try {
      let allReviews = [];
      let page =   1; // Start with the first page
  
      while (true) {
        const response = await api.get(`/api/reviews?populate=*&pagination[page]=${parseInt(page,   10)}`);
  
        // Assuming response.data is an array, proceed with adding to the allReviews array
        const currentPageReviews = response?.data?.data || [];
        allReviews = [...allReviews, ...currentPageReviews];
  
        // Check if there is a next page in the pagination information
        const nextPage = response?.data?.meta?.pagination.pageCount;
        if (nextPage === page || nextPage === 0) {
          break; // No more pages, exit the loop
        }
  
        // Move to the next page
        page++;
      }
  
      return allReviews;
    } catch (error) {
      console.log("Error fetching reviews:", error);
      throw error;
    }
  };
  

  const { data, isLoading,isError } = useQuery(
    { queryKey: ["reviews"], queryFn: fetchReviews,
      retry: 3, // Number of retry attempts if the request fails
      retryDelay: 1000, // Delay between retries in milliseconds
      staleTime: 5 * 60 * 1000, //

     }
  ); // Changed the query key to 'superheroes'
  
  return {
    data,
    isLoading,
    isError
  };
}


