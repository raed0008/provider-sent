// const  axios =  require("axios");
// // const CategoryNum = 2
// // Fetch data from Endpoint 1
// async function fetchUsers(CategoryNum) {
//     try {
//       const response = await axios.get(`https://n.epento.com/api/categories/${CategoryNum}?populate=deep,4`);
//     //   const users = await response.json();
//     console.log("the date fetching user is ",response?.data?.data?.length)
//       return response?.data?.data;
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     //   throw error;
//     }
//   }
//   const createUser = async (data) => {
//     try {
//       const createdUser = await axios.post("http://192.168.1.11:1337/api/users", {
//           ...data,
        
//       });
//       return createdUser;
//     } catch (error) {
//       console.log("Error creating the user ", error?.response?.data);
//     }
//   };
//    const CreateProvider = async (CategoryNum,data) => {
//     try {
//       const createdUser = await axios.put(`https://admin.njik.sa/api/categories/${CategoryNum}`, {
//         data: {
//           ...data,
//         },
//       });
//       return createdUser;
//     } catch (error) {
//       console.log("Error creating the user ", error?.response?.data?.error?.details);
//     }
//   };
//   async function postData(data) {
//     try {
//       const response = await CreateProvider(data);
//       console.log('the response for the user return is ',response)
//       return response;
//     } catch (error) {
//       if (error.response && error.response.data && error.response.data.error) {
//         console.error('Error creating user:', error.response.data.error);
//       } else {
//         console.error('Error posting data:', error?.code);
//       }
//     //   throw error;
//     }
//   }
  
//   // Fetch users and post data
//   async function fetchAndPostData() {
//     try {
//         let start = 1;
//         let end = 28 ; 
//         while(start !== end ){

//             const users = await fetchUsers(start);
//             if(users){
//                 let arr = users?.attributes?.services?.data?.map((service=>({id:service?.id})))
//                 console.log('the user orders is ',users?.attributes?.image?.data[0]?.id)
                
//                 // user.password=user?.username+user?.email;
                
//                 await  CreateProvider(start,{
//                     image:users?.attributes?.image?.data[0]?.id
//                 })
//             }
//             start++;
            
//         }
//     //   if(user){
//     //    const res =  await postData(user);
//     //    if(res){
         
//     //      console.log('Data posted successfully',res?.data?.data);
//     //     }
//     //   }
//         // }
//     } catch (error) {
//       console.error('Error fetching and posting data:',error);
//     }
//   }
  
//   // Call the main function
//   fetchAndPostData();