import axios from 'axios';
import useStore from '@/store/useStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    // Retrieve the latest state from Zustand
    const state = useStore.getState();
    const token = state.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle standard 401s
api.interceptors.response.use(
  (response) => response.data, // Strip the axios config layer
  (error) => {
    if (error.response?.status === 401) {
      useStore.getState().logout();
    }
    return Promise.reject(error.response?.data || error); // Forward backend JSON error
  }
);

export default api;
