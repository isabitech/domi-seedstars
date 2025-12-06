import axios from "axios";
import { retrieveTokenFromStorage } from "../utils/helpers";

const baseURL = "https://domi-be.onrender.com/api/v1" 
// const baseURLLocal = "http://localhost:5000/api/v1";
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || baseURL,
  // baseURL: baseURLLocal,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token from session storage
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await retrieveTokenFromStorage();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;