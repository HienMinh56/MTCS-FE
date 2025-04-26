import axiosInstance from "../utils/axiosConfig";
import { ApiResponse } from "../types/api-types";
import {
  AdminRevenueAnalytics,
  AdminCustomerRevenue,
  AdminTripFinancial,
  AdminRevenuePeriodType,
  PagedCustomerRevenue,
  TripPerformanceDTO,
} from "../types/admin-finance";

const BASE_URL = "/api/Admin";

export const getAdminRevenueAnalytics = async (
  periodType: AdminRevenuePeriodType,
  startDate: string,
  endDate?: string
): Promise<ApiResponse<AdminRevenueAnalytics>> => {
  const params = {
    periodType,
    startDate,
    ...(endDate && { endDate }),
  };

  const response = await axiosInstance.get(`${BASE_URL}/revenue`, { params });
  return response.data;
};

export const getAdminRevenueByCustomer = async (
  startDate?: string,
  endDate?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PagedCustomerRevenue>> => {
  const params = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    pageNumber: page,
    pageSize,
  };

  const response = await axiosInstance.get(`${BASE_URL}/revenue/customers`, {
    params,
  });
  return response.data;
};

export const getAdminTripFinancialDetailsById = async (
  tripId: string
): Promise<ApiResponse<AdminTripFinancial>> => {
  const response = await axiosInstance.get(
    `${BASE_URL}/trips/financial/${tripId}`
  );
  return response.data;
};

export const getAdminTripsFinancialDetails = async (
  startDate?: string,
  endDate?: string,
  customerId?: string
): Promise<ApiResponse<AdminTripFinancial[]>> => {
  const params = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(customerId && { customerId }),
  };

  const response = await axiosInstance.get(`${BASE_URL}/trips/financial`, {
    params,
  });
  return response.data;
};

export const getAdminAverageFuelCostPerDistance = async (
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<number>> => {
  const params = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const response = await axiosInstance.get(`${BASE_URL}/fuel/average-cost`, {
    params,
  });
  return response.data;
};

export const getAdminTripPerformance = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<TripPerformanceDTO>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<TripPerformanceDTO>>(
      `${BASE_URL}/trips/performance?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching admin trip performance data:", error);
    const defaultPerformanceData: TripPerformanceDTO = {
      period: `${startDate} - ${endDate}`,
      totalTrips: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      paidRevenue: 0,
      unpaidRevenue: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      totalDistance: 0,
      averageDistance: 0,
      totalFuelCost: 0,
      averageFuelCost: 0,
      fuelCostPerDistance: 0,
      incidentRate: 0,
      onTimeDeliveryRate: 0,
    };

    return {
      success: false,
      message: "Không thể tải dữ liệu hiệu suất chuyến đi",
      messageVN: "Không thể tải dữ liệu hiệu suất chuyến đi",
      data: defaultPerformanceData,
      errors: null,
    };
  }
};
