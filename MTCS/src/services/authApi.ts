import axios from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "../types/api-types";
import axiosInstance from "../utils/axiosConfig";

const AUTH_BASE_PATH = "/api/Authen";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface TokenData {
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokenData: TokenData;
  message: string;
}

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const storeTokens = (tokens: TokenData) => {
  Cookies.set("token", tokens.token, {
    secure: true,
    sameSite: "strict",
  });

  Cookies.set("refreshToken", tokens.refreshToken, {
    secure: true,
    sameSite: "strict",
  });

  const tokenData = parseJwt(tokens.token);
  if (tokenData && tokenData.sub) {
    localStorage.setItem("userId", tokenData.sub);
    // Remove storing userRole in localStorage - it will be handled by the context
  }
};

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse<TokenData>>(
      `${AUTH_BASE_PATH}/login`,
      credentials
    );

    if (!response.data.success) {
      throw new Error(
        response.data.messageVN || // Backend logic error (primary error message)
          response.data.message ||
          "Login failed"
      );
    }

    if (response.data.data?.token && response.data.data?.refreshToken) {
      storeTokens(response.data.data);
      return {
        tokenData: response.data.data,
        message:
          response.data.messageVN ||
          response.data.message ||
          "Đăng nhập thành công",
      };
    }

    throw new Error("Invalid token data received");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        throw error;
      }

      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy người dùng");
      }

      throw new Error("Đăng nhập thất bại");
    }

    throw new Error("Đăng nhập thất bại");
  }
};

export const register = async (userData: RegisterRequest): Promise<string> => {
  try {
    const response = await axiosInstance.post<ApiResponse<string>>(
      `${AUTH_BASE_PATH}/register`,
      userData
    );

    if (!response.data.success) {
      throw new Error(
        response.data.messageVN || // Backend logic error (primary error message)
          response.data.message ||
          "Registration failed"
      );
    }

    return (
      response.data.messageVN ||
      response.data.message ||
      "Registration successful"
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data as ApiResponse<string>;
      // Prioritize messageVN for backend logic errors
      throw new Error(
        responseData.messageVN || responseData.message || "Registration failed"
      );
    }
    throw error;
  }
};

export const refreshTokens = async (): Promise<TokenData> => {
  const currentToken = Cookies.get("token");
  const currentRefreshToken = Cookies.get("refreshToken");

  if (!currentToken || !currentRefreshToken) {
    throw new Error("No tokens to refresh");
  }

  try {
    const response = await axiosInstance.post<ApiResponse<TokenData>>(
      `${AUTH_BASE_PATH}/refresh-token`,
      {
        token: currentToken,
        refreshToken: currentRefreshToken,
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.messageVN || // Backend logic error (primary error message)
          response.data.message ||
          "Token refresh failed"
      );
    }

    storeTokens(response.data.data);
    return response.data.data;
  } catch (error) {
    logout();
    if (axios.isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data as ApiResponse;
      // Prioritize messageVN for backend logic errors
      throw new Error(
        responseData.messageVN || responseData.message || "Token refresh failed"
      );
    }
    throw error;
  }
};

export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  localStorage.removeItem("userId");
  // No need to remove userRole from localStorage as we're no longer storing it there
};

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
        const newTokens = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default {
  login,
  register,
  refreshTokens,
  logout,
};
