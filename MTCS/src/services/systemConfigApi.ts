import axiosInstance from "../utils/axiosConfig";
import { ApiResponse } from "../types/api-types";

export interface SystemConfiguration {
  configId: number;
  configKey: string;
  configValue: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string | null;
  updatedBy: string | null;
}

export const getSystemConfigurations = async (): Promise<
  ApiResponse<SystemConfiguration[]>
> => {
  try {
    const response = await axiosInstance.get<
      ApiResponse<SystemConfiguration[]>
    >("/api/SystemConfiguration");
    return response.data;
  } catch (error) {
    console.error("Error fetching system configurations:", error);
    throw error;
  }
};

export const updateSystemConfiguration = async (
  configId: number,
  configValue: string
): Promise<ApiResponse<SystemConfiguration>> => {
  try {
    const formData = new FormData();
    formData.append("configValue", configValue);

    const response = await axiosInstance.put<ApiResponse<SystemConfiguration>>(
      `/api/SystemConfiguration/${configId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating system configuration:", error);
    throw error;
  }
};
