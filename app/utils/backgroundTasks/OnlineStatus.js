import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { updateUserData } from '../../../utils/user';
const updateUserStatus = async(status)=>{
    try {
      const response = await updateUserData(user?.id,{
        online:status
      })
       if(response){
        console.log('response returnedsff',response)
       }
    } catch (error) {
     console.log('error change stastue',error) 
    }
  }  
// Define the background task
TaskManager.defineTask('USER_STATUS_BACKGROUND_TASK', async () => {
  try {
    // Update user status to offline
    
  } catch (error) {
    console.error('Failed to update user status:', error);
  }
});
