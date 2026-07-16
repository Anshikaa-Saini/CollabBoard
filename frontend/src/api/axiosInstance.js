import axios from "axios";
import toast from "react-hot-toast";
import { TOKEN_KEY, USER_KEY } from "../constants/storageKeys";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token (if present) to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized handling for auth expiry and network failures, so every screen
// gets consistent feedback without repeating this logic per API call.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Only surface this if the person was actually logged in (avoids a
      // spurious toast on, say, a public page that never had a session) and
      // avoid redirect loops if already on the login page.
      if (hadToken && window.location.pathname !== "/login") {
        toast.error("Your session has expired. Please log in again.", { id: "session-expired" });
        window.location.href = "/login";
      }
    } else if (!error.response) {
      // No response at all - backend unreachable, CORS failure, offline, etc.
      // Using a fixed toast id collapses repeated failures (e.g. a burst of
      // requests during an outage) into a single toast instead of stacking.
      toast.error("Network error - please check your connection.", { id: "network-error" });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
