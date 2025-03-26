import axios from "axios";
import Cookies from "js-cookie";
import { ApiResponse } from "../types/api-types";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface Driver {
  driverId: string;
  fullName: string;
  email: string;
  createdBy: string | null;
  status: number;
  phoneNumber?: string;
  dateOfBirth?: string | null; // Updated to match API response
  totalKm?: number;
  createdDate?: string;
  modifiedDate?: string | null;
  modifiedBy?: string | null;
  totalWorkingTime?: number;
  currentWeekWorkingTime?: number;
  fileUrls?: string[];
  // Add other properties as needed
}

interface DriversResponse extends ApiResponse {
  data: {
    items: Driver[];
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

// Function to get all drivers
export const getAllDrivers = async (): Promise<Driver[]> => {
  try {
    const response = await api.get<DriversResponse>('/Driver');
    return response.data.data.items;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
};

// Function to get a specific driver by ID
export const getDriverById = async (driverId: string): Promise<Driver> => {
  try {
    const response = await api.get<ApiResponse>(`/Driver/${driverId}/profile`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching driver details:', error);
    throw error;
  }
};

// Function to view driver details - handles fetching and formatting
export const viewDriverDetails = async (driverId: string): Promise<Driver> => {
  try {
    const driverData = await getDriverById(driverId);
    return driverData;
  } catch (error) {
    console.error(`Error viewing driver with ID ${driverId}:`, error);
    throw error;
  }
};

// Map status code to text representation
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
