import axiosInstance from "../utils/axiosConfig";
import { ApiResponse } from "../types/api-types";

export interface Driver {
  driverId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: number;
  createdBy?: string | null;
  dateOfBirth?: string | null;
  totalKm?: number;
  createdDate?: string;
  modifiedDate?: string | null;
  modifiedBy?: string | null;
  totalWorkingTime?: number;
  currentWeekWorkingTime?: number;
  totalOrder?: number;
  fileUrls?: string[];
}

export interface PaginatedData<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

export interface DriversResponse extends ApiResponse {
  data: PaginatedData<Driver>;
}

export interface DriverParams {
  pageNumber?: number;
  pageSize?: number;
  status?: number;
  keyword?: string;
}

export const getDrivers = async (
  params?: DriverParams
): Promise<DriversResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.pageNumber)
      queryParams.append("pageNumber", params.pageNumber.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.status !== undefined)
      queryParams.append("status", params.status.toString());
    if (params?.keyword) queryParams.append("keyword", params.keyword);

    const url = `${import.meta.env.VITE_API_BASE_URL}/api/Driver${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await axiosInstance.get<DriversResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
};

export const getDriverById = async (driverId: string): Promise<Driver> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/Driver/profile?driverId=${driverId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching driver details:", error);
    throw error;
  }
};

export const getDriverStatusText = (status: number): string => {
  switch (status) {
    case 1:
      return "active";
    case 2:
      return "inactive";
    case 3:
      return "on_trip";
    default:
      return "unknown";
  }
};
