import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Important for Sanctum CSRF cookies if using cookie-based auth
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to attach the Sanctum token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
