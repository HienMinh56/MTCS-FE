import axiosInstance from "../utils/axiosConfig";
import {
  Driver,
  DriverListParams,
  PaginatedData,
  DriverStatus,
} from "../types/driver";

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  messageVN: string | null;
  errors: any | null;
}

export const getDriverList = async (
  params: DriverListParams = {}
): Promise<ApiResponse<PaginatedData<Driver>>> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.pageNumber !== undefined) {
      queryParams.append("pageNumber", params.pageNumber.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    if (params.status !== undefined && params.status !== null) {
      queryParams.append("status", params.status.toString());
    }

    if (params.keyword) {
      queryParams.append("keyword", params.keyword);
    }

    const url = `/api/Driver${
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

export const getDriverById = async (driverId: string): Promise<Driver> => {
  try {
    const url = `/api/Driver/profile?driverId=${encodeURIComponent(driverId)}`;
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

  Object.keys(driverData).forEach((key) => {
    if (driverData[key] !== undefined && driverData[key] !== null) {
      formData.append(key, driverData[key]);
    }
  });

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

  try {
    const response = await axiosInstance.post(
      `/api/Authen/create-driver`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error: any) {
    console.error("Failed to create driver:", error);
    if (error.response && error.response.data) {
      return { data: error.response.data };
    }
    throw error;
  }
};

export interface UpdateDriverResponse {
  success: boolean;
  data: Driver | null;
  message: string;
  messageVN: string | null;
  errors: { [key: string]: string[] } | null;
}

export const updateDriverWithFiles = async (
  driverId: string,
  driverData: Record<string, any>,
  newFiles: FileUpload[] = [],
  fileIdsToRemove: string[] = []
): Promise<UpdateDriverResponse> => {
  const formData = new FormData();

  Object.keys(driverData).forEach((key) => {
    if (driverData[key] !== undefined && driverData[key] !== null) {
      formData.append(key, driverData[key]);
    }
  });

  newFiles.forEach((fileUpload, index) => {
    formData.append(`newFiles[${index}].file`, fileUpload.file);
    formData.append(`newFiles[${index}].description`, fileUpload.description);

    if (fileUpload.note) {
      formData.append(`newFiles[${index}].note`, fileUpload.note);
    }
  });

  fileIdsToRemove.forEach((fileId, index) => {
    formData.append(`fileIdsToRemove[${index}]`, fileId);
  });

  const url = `/api/Driver/${driverId}`;

  try {
    const response = await axiosInstance.put<UpdateDriverResponse>(
      url,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Failed to update driver ${driverId}:`, error);

    if (error.response && error.response.data) {
      return error.response.data;
    }

    return {
      success: false,
      data: null,
      message: error.message || "Failed to update driver",
      messageVN: "Không thể cập nhật thông tin tài xế",
      errors: null,
    };
  }
};

export interface FileDetailsDTO {
  description: string;
  note?: string;
}

export const updateDriverFileDetails = async (
  fileId: string,
  updateData: FileDetailsDTO
): Promise<ApiResponse> => {
  try {
    const url = `/api/Driver/file/${fileId}`;

    const response = await axiosInstance.put<ApiResponse>(url, updateData);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to update file ${fileId}:`, error);

    if (error.response && error.response.data) {
      return error.response.data;
    }

    return {
      success: false,
      data: null,
      message: error.message || "Failed to update file details",
      messageVN: "Không thể cập nhật thông tin tài liệu",
      errors: null,
    };
  }
};

export const activateDriver = async (
  driverId: string
): Promise<ApiResponse<boolean>> => {
  try {
    const url = `/api/Driver/activate-driver/${driverId}`;
    const response = await axiosInstance.put<ApiResponse<boolean>>(url);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to activate driver ${driverId}:`, error);

    if (error.response && error.response.data) {
      return error.response.data;
    }

    return {
      success: false,
      data: false,
      message: error.message || "Failed to activate driver",
      messageVN: "Không thể kích hoạt tài xế",
      errors: null,
    };
  }
};

export const deactivateDriver = async (
  driverId: string
): Promise<ApiResponse<boolean>> => {
  try {
    const url = `/api/Driver/deactivate-driver/${driverId}`;
    const response = await axiosInstance.put<ApiResponse<boolean>>(url);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to deactivate driver ${driverId}:`, error);

    if (error.response && error.response.data) {
      return error.response.data;
    }

    return {
      success: false,
      data: false,
      message: error.message || "Failed to deactivate driver",
      messageVN: "Không thể vô hiệu hóa tài xế",
      errors: null,
    };
  }
};
