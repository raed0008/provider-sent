import { useQuery } from '@tanstack/react-query';
import api from './index'

 export default function useTerms() {
  const fetchTerms = async () => {
    try {
      const response = await api.get(`/api/terms?populate=*`);
      
      return response.data
    } catch (error) {
      console.error("Error fetching Terms:", error);
      throw error;
    }
  };

  const { data, isLoading,isError } = useQuery(
    { queryKey: ["Terms"], queryFn: fetchTerms,
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


