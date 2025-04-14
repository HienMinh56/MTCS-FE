import axiosInstance from "../utils/axiosConfig";
import { ApiResponse } from "../types/api-types";
import {
  AdminRevenueAnalytics,
  AdminCustomerRevenue,
  AdminTripFinancial,
  AdminProfitAnalytics,
  AdminRevenuePeriodType,
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
  endDate?: string
): Promise<ApiResponse<AdminCustomerRevenue[]>> => {
  const params = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const response = await axiosInstance.get(`${BASE_URL}/revenue/customers`, {
    params,
  });
  return response.data;
};

export const getAdminTripFinancialDetails = async (
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

export const getAdminProfitAnalytics = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<AdminProfitAnalytics>> => {
  const params = {
    startDate,
    endDate,
  };

  const response = await axiosInstance.get(`${BASE_URL}/profit`, { params });
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
