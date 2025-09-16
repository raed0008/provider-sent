import { useCallback, useEffect } from "react"
import useOrders from "./orders"
import api from ".";
import { useQuery } from "@tanstack/react-query";
import { updateUserData, updateUserDataClient } from "./user";
import axios from "axios";
// import { updateuserData } from "../app/utils/firebase/user";
export default function useProviders() {
    const fetchOrders = useCallback(async () => {
      try {
        let allOrders = [];
        let page =   1; // Start with the first page
    
        while (true) {
          const response = await axios.get(`https://n.epento.com/api/providers?populate=deep,4&pagination[page]=${parseInt(page, 10)}`);
         
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
         
    
        return{
          data: allOrders
        }
      } catch (error) {
        console.log("Error fetching orders:", error);
        throw error;
      }
    },[])
    
  
    const { data, isLoading, isError,refetch } = useQuery({
      queryKey: ["providers"],
      queryFn: fetchOrders,
      refetchIntervalInBackground:true,
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
  const getUsers = async()=>{
    try {
      const users = await axios.get('https://n.epento.com/api/users')
      if(users) {
        console.log('the current user arae ',users?.data?.length)
        return users
      }
    } catch (error) {
      console.log('error getting the users')
    }
  }
export const Loop = ()=>{
    const {data} = useOrders()
    const handel = async()=>{
      try {
        const users = await  getUsers()
        if(data){
       if(users){
        console.log('fetching the sprovider data is daftffa **ggg**ff*ff***4$f£££f£ffff£££££££££',users?.data?.length)

    
          //  providers?.data?.map((provider)=>{
          //    let orderArrayToConnect = []
          //    data?.data?.map((order)=>{
          //      if(order?.attributes?.provider?.data?.id === provider?.id){
          //        orderArrayToConnect.push({
          //          id:order?.id
          //         })
                  
          //             console.log('the current orderfffff is orders ',order?.attributes?.provider?.data?.id === provider?.id)
          //     }
          //   })
          //    updateUserData(provider?.id,{
          //           orders:{
          //               connect:orderArrayToConnect
          //             }
          //             })
          //   console.log('the provider data is£££££ff£££££££££k£££££££ d2d222',provider?.id,orderArrayToConnect)
          // })
          users?.data?.map((user)=>{
             let orderArrayToConnect = []
             data?.data?.map((order)=>{
               if(order?.attributes?.user?.data?.id === user?.id){
                 orderArrayToConnect.push({
                   id:order?.id
                  })
                  
                }
              })
                console.log('the current orderfffff is orfders ',orderArrayToConnect?.length,user?.id)
                updateUserDataClient(user?.id,{
                    orders:{
                        connect:orderArrayToConnect
                      }
                      })
            // console.log('the provider data is£££££ff£££££££££k£££££££ d2d222',provider?.id,orderArrayToConnect)
          })
        }
      }
      } catch (error) {
        
      }
    }
    useEffect(()=>{
        handel()
    },[])
    return null

}