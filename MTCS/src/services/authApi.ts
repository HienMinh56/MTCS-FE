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
  const refreshToken = Cookies.get("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    // Send only the refresh token string in the request body as expected by the API
    const refreshResponse = await axios.post<ApiResponse<TokenData>>(
      `${
        import.meta.env.VITE_API_BASE_URL || "https://localhost:7046"
      }${AUTH_BASE_PATH}/refresh-token`,
      JSON.stringify(refreshToken),
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (!refreshResponse.data.success || !refreshResponse.data.data) {
      throw new Error(
        refreshResponse.data.messageVN ||
          refreshResponse.data.message ||
          "Token refresh failed"
      );
    }

    const newTokens = refreshResponse.data.data;

    Cookies.set("token", newTokens.token, {
      secure: true,
      sameSite: "strict",
    });

    Cookies.set("refreshToken", newTokens.refreshToken, {
      secure: true,
      sameSite: "strict",
    });

    const tokenData = parseJwt(newTokens.token);
    if (tokenData && tokenData.sub) {
      localStorage.setItem("userId", tokenData.sub);
    }

    window.dispatchEvent(new Event("auth-changed"));

    return newTokens;
  } catch (error) {
    console.error("Token refresh error:", error);
    logout();
    throw new Error("Token refresh failed");
  }
};

export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  localStorage.removeItem("userId");
  // Dispatch event to notify components about logout
  window.dispatchEvent(new Event("auth-changed"));
};

export default {
  login,
  register,
  refreshTokens,
  logout,
};
