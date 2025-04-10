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
    return {
      success: false,
      data: { trailers: { items: [] } },
      message: "Error fetching trailers",
    };
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

export const createTrailerWithFiles = async (
  trailerData: {
    licensePlate: string;
    brand: string;
    manufactureYear: number;
    maxLoadWeight: number;
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    registrationDate: string;
    registrationExpirationDate: string;
    containerSize: number;
  },
  fileUploads: Array<{
    file: File;
    description: string;
    note?: string;
  }>
) => {
  const formData = new FormData();

  // Map containerSize from UI values (20/40) to backend enum values (1/2)
  const containerSizeMap = {
    20: 1, // Feet20
    40: 2, // Feet40
  };

  Object.entries(trailerData).forEach(([key, value]) => {
    if (key === "containerSize") {
      const mappedValue =
        containerSizeMap[value as keyof typeof containerSizeMap] || 1;
      formData.append(key, mappedValue.toString());
    } else {
      formData.append(key, value.toString());
    }
  });

  fileUploads.forEach((upload, index) => {
    formData.append(`fileUploads[${index}].file`, upload.file);
    formData.append(`fileUploads[${index}].description`, upload.description);
    if (upload.note) {
      formData.append(`fileUploads[${index}].note`, upload.note);
    }
  });

  const response = await axiosInstance.post(
    "/api/Trailer/create-with-files",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};

export const deactivateTrailer = async (id: string) => {
  const response = await axiosInstance.put(
    `/api/Trailer/deactivate-trailer/${id}`
  );
  return response.data;
};

export const activateTrailer = async (id: string) => {
  try {
    const response = await axiosInstance.put(
      `/api/Trailer/activate-trailer/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateTrailerWithFiles = async (
  trailerId: string,
  trailerData: {
    licensePlate: string;
    brand: string;
    manufactureYear: number;
    maxLoadWeight: number;
    lastMaintenanceDate: string;
    nextMaintenanceDate: string;
    registrationDate: string;
    registrationExpirationDate: string;
    containerSize: number;
  },
  fileUploads: Array<{
    file: File;
    description: string;
    note?: string;
  }>,
  filesToRemove: string[] = []
) => {
  const formData = new FormData();

  const containerSizeMap = {
    20: 1,
    40: 2,
  };

  // Add trailer data
  Object.entries(trailerData).forEach(([key, value]) => {
    if (key === "containerSize") {
      const mappedValue =
        containerSizeMap[value as keyof typeof containerSizeMap] || 1;
      formData.append(key, mappedValue.toString());
    } else {
      formData.append(key, value.toString());
    }
  });

  // Add files to remove
  filesToRemove.forEach((fileId) => {
    formData.append("fileIdsToRemove", fileId);
  });

  // Add new file uploads
  fileUploads.forEach((upload, index) => {
    formData.append(`newFiles[${index}].file`, upload.file);
    formData.append(`newFiles[${index}].description`, upload.description);
    if (upload.note) {
      formData.append(`newFiles[${index}].note`, upload.note);
    }
  });

  try {
    const response = await axiosInstance.put(
      `/api/Trailer/${trailerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateTrailerFileDetails = async (
  fileId: string,
  fileData: {
    description: string;
    note: string;
  }
) => {
  try {
    const response = await axiosInstance.put(
      `/api/Trailer/update-file/${fileId}`,
      fileData
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};
