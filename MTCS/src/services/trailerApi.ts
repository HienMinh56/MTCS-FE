import {
  Trailer,
  TrailerStatus,
  TrailerResponse,
  TrailerDetailsResponse,
} from "../types/trailer";
import axiosInstance from "../utils/axiosConfig";

export const getTrailers = async (
  page: number,
  pageSize: number,
  searchKeyword?: string,
  status?: TrailerStatus,
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

    const response = await axiosInstance.get<TrailerResponse>(
      `/api/Trailer?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching trailers:", error);
    throw error;
  }
};

export const getTrailerDetails = async (id: string) => {
  const response = await axiosInstance.get<TrailerDetailsResponse>(
    `/api/Trailer/${id}`
  );
  return response.data;
};

export const deleteTrailer = async (id: string) => {
  const response = await axiosInstance.delete(`/api/Trailer/${id}`);
  return response.data;
};

export const createTrailer = async (trailerData: {
  licensePlate: string;
  brand: string;
  manufactureYear: number;
  maxLoadWeight: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  registrationDate: string;
  registrationExpirationDate: string;
  containerSize: number;
}) => {
  const response = await axiosInstance.post(
    "/api/Trailer/create-trailer",
    trailerData
  );
  return response;
};

export const deactivateTrailer = async (id: string) => {
  const response = await axiosInstance.put(
    `/api/Trailer/deactivate-trailer/${id}`
  );
  return response.data;
};
