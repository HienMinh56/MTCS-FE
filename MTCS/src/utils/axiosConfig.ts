import axios from "axios";
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired =
      error.response?.headers?.["token-expired"] === "true";

    if (
      error.response?.status === 401 &&
      isTokenExpired &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Import needed functions inline to avoid circular dependency
        const { refreshTokens } = await import("../services/authApi");
        const newTokens = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        const { logout } = await import("../services/authApi");
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
