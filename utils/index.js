import axios from "axios";
import {    EXPO_PUBLIC_BASE_URL,EXPO_PUBLIC_AUTH_SECRECT} from "@env"
const api = axios.create({
  baseURL:     EXPO_PUBLIC_BASE_URL, // Set your base URL
  headers:{
    Authorization:EXPO_PUBLIC_AUTH_SECRECT

  }
});

export default  api


