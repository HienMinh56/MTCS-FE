import axiosInstance from "../utils/axiosConfig";
import {
  Driver,
  DriverListParams,
  PaginatedData,
  DriverStatus,
} from "../types/driver";

// API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  messageVN: string | null;
  errors: any | null;
}

// Get all drivers with pagination and filters
export const getDriverList = async (
  params: DriverListParams = {}
): Promise<ApiResponse<PaginatedData<Driver>>> => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination parameters
    if (params.pageNumber !== undefined) {
      queryParams.append("pageNumber", params.pageNumber.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    // Add filter parameters
    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", params.status.toString());
    }

    if (params.keyword) {
      queryParams.append("keyword", params.keyword);
    }

    // Build URL with query parameters
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/Driver${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axiosInstance.get<
      ApiResponse<PaginatedData<Driver>>
    >(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    throw error;
  }
};

// Get driver by ID
export const getDriverById = async (driverId: string): Promise<Driver> => {
  try {
    const url = `${
      import.meta.env.VITE_API_BASE_URL
    }/api/Driver/profile?driverId=${encodeURIComponent(driverId)}`;
    const response = await axiosInstance.get<ApiResponse<Driver>>(url);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to load driver");
    }

    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch driver ${driverId}:`, error);
    throw error;
  }
};

export interface FileUpload {
  file: File;
  description: string;
  note?: string;
}

export interface CreateDriverResponse {
  success: boolean;
  data: {
    driverId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  message: string;
  messageVN: string | null;
  errors: { [key: string]: string[] } | null;
}

export const createDriverWithFiles = async (
  driverData: Record<string, any>,
  fileUploads: FileUpload[]
): Promise<{ data: CreateDriverResponse }> => {
  const formData = new FormData();

  // Add driver data
  Object.keys(driverData).forEach((key) => {
    if (driverData[key] !== undefined && driverData[key] !== null) {
      formData.append(key, driverData[key]);
    }
  });

  // Add file uploads
  fileUploads.forEach((fileUpload, index) => {
    formData.append(`fileUploads[${index}].file`, fileUpload.file);
    formData.append(
      `fileUploads[${index}].description`,
      fileUpload.description
    );

    if (fileUpload.note) {
      formData.append(`fileUploads[${index}].note`, fileUpload.note);
    }
  });

  return await axiosInstance.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/Authen/create-driver`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
