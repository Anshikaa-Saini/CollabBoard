import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token (if present) to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("collabboard_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Globally handle expired/invalid tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("collabboard_token");
      localStorage.removeItem("collabboard_user");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
