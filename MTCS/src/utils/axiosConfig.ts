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

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

axiosInstance.interceptors.response.use(
  (response) => {
    // Handle potential encoding issues with string responses
    if (
      typeof response.data === "string" &&
      response.headers["content-type"]?.includes("application/json")
    ) {
      try {
        // Try to parse and re-stringify to ensure proper encoding
        const parsed = JSON.parse(response.data);
        response.data = parsed;
      } catch (e) {
        console.warn("Response parsing error:", e);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const { refreshTokens } = await import("../services/authApi");

          const newTokens = await refreshTokens();

          onTokenRefreshed(newTokens.token);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
          return axiosInstance(originalRequest);
        } catch (error) {
          console.error("Token refresh failed:", error);
          isRefreshing = false;

          const { logout } = await import("../services/authApi");
          logout();

          return Promise.reject(error);
        }
      } else {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
