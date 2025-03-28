import {
  Tractor,
  TractorStatus,
  TractorResponse,
  TractorDetailsResponse,
} from "../types/tractor";
import axiosInstance from "../utils/axiosConfig";

export const getTractors = async (
  page: number,
  pageSize: number,
  searchKeyword?: string,
  status?: TractorStatus,
  maintenanceDueSoon?: boolean,
  registrationExpiringSoon?: boolean,
  maintenanceDueDays?: number,
  registrationExpiringDays?: number
) => {
  try {
    const params = new URLSearchParams();

    params.append("pageNumber", page.toString());
    params.append("pageSize", pageSize.toString());

    if (searchKeyword) {
      params.append("searchKeyword", searchKeyword);
    }

    if (status !== undefined) {
      params.append("status", status.toString());
    }

    if (maintenanceDueSoon !== undefined) {
      params.append("maintenanceDueSoon", maintenanceDueSoon.toString());
    }

    if (registrationExpiringSoon !== undefined) {
      params.append(
        "registrationExpiringSoon",
        registrationExpiringSoon.toString()
      );
    }

    if (maintenanceDueDays !== undefined) {
      params.append("maintenanceDueDays", maintenanceDueDays.toString());
    }

    if (registrationExpiringDays !== undefined) {
      params.append(
        "registrationExpiringDays",
        registrationExpiringDays.toString()
      );
    }

    const response = await axiosInstance.get<TractorResponse>(
      `/api/Tractor?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tractors:", error);
    throw error;
  }
};

export const getTractorDetails = async (id: string) => {
  const response = await axiosInstance.get<TractorDetailsResponse>(
    `/api/Tractor/${id}`
  );
  return response.data;
};

export const deleteTractor = async (id: string) => {
  const response = await axiosInstance.delete(`/api/Tractor/${id}`);
  return response.data;
};

export const createTractor = async (tractorData: {
  licensePlate: string;
  brand: string;
  manufactureYear: number;
  maxLoadWeight: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  registrationDate: string;
  registrationExpirationDate: string;
  containerType: number;
}) => {
  const response = await axiosInstance.post(
    "/api/Tractor/create-tractor",
    tractorData
  );
  return response;
};

export const deactivateTractor = async (id: string) => {
  const response = await axiosInstance.put(
    `/api/Tractor/deactivate-tractor/${id}`
  );
  return response.data;
};
