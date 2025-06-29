import {
  Tractor,
  TractorStatus,
  TractorResponse,
  TractorDetailsResponse,
  TractorUseHistoryResponse,
  PaginationParams,
} from "../types/tractor";
import axiosInstance from "../utils/axiosConfig";

// Cache for frequently accessed tractor data
const tractorCache = new Map<
  string,
  { data: TractorResponse; timestamp: number }
>();
const CACHE_DURATION = 5000; // 5 seconds cache

// Create a cache key from request parameters
const createCacheKey = (
  page: number,
  pageSize: number,
  searchKeyword?: string,
  status?: TractorStatus,
  maintenanceDueSoon?: boolean,
  registrationExpiringSoon?: boolean
) => {
  return JSON.stringify({
    page,
    pageSize,
    searchKeyword,
    status,
    maintenanceDueSoon,
    registrationExpiringSoon,
  });
};

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
    // Check cache first
    const cacheKey = createCacheKey(
      page,
      pageSize,
      searchKeyword,
      status,
      maintenanceDueSoon,
      registrationExpiringSoon
    );
    const now = Date.now();
    const cachedResult = tractorCache.get(cacheKey);

    if (cachedResult && now - cachedResult.timestamp < CACHE_DURATION) {
      return cachedResult.data;
    }

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

    tractorCache.set(cacheKey, {
      data: response.data,
      timestamp: now,
    });

    // Return the full response for maximum compatibility
    return response.data;
  } catch (error) {
    console.error("Error fetching tractors:", error);
    return {
      success: false,
      data: { tractors: { items: [] } },
      message: "Error fetching tractors",
    };
  }
};

// Clear cache when data is modified
const clearCache = () => {
  tractorCache.clear();
};

export const getTractorDetails = async (id: string) => {
  const response = await axiosInstance.get<TractorDetailsResponse>(
    `/api/Tractor/${id}`
  );
  return response.data;
};

export const deleteTractor = async (id: string) => {
  const response = await axiosInstance.delete(`/api/Tractor/${id}`);
  clearCache(); // Clear cache when modifying a tractor
  return response.data;
};

export const createTractorWithFiles = async (
  tractorData: {
    licensePlate: string;
    brand: string;
    manufactureYear: number;
    maxLoadWeight: number;
    lastMaintenanceDate: string | null;
    nextMaintenanceDate: string;
    registrationDate: string;
    registrationExpirationDate: string;
    containerType: number;
  },
  fileUploads: Array<{
    file: File;
    description: string;
    note?: string;
  }>
) => {
  const formData = new FormData();

  // Handle each field individually rather than using Object.entries
  formData.append("licensePlate", tractorData.licensePlate);
  formData.append("brand", tractorData.brand);
  formData.append("manufactureYear", tractorData.manufactureYear.toString());
  formData.append("maxLoadWeight", tractorData.maxLoadWeight.toString());
  formData.append("nextMaintenanceDate", tractorData.nextMaintenanceDate);
  formData.append("registrationDate", tractorData.registrationDate);
  formData.append(
    "registrationExpirationDate",
    tractorData.registrationExpirationDate
  );
  formData.append("containerType", tractorData.containerType.toString());

  // Only add lastMaintenanceDate if it's not null and not a default date
  if (
    tractorData.lastMaintenanceDate &&
    !tractorData.lastMaintenanceDate.includes("0001-01-01")
  ) {
    formData.append("lastMaintenanceDate", tractorData.lastMaintenanceDate);
  }

  fileUploads.forEach((upload, index) => {
    formData.append(`fileUploads[${index}].file`, upload.file);
    formData.append(`fileUploads[${index}].description`, upload.description);
    if (upload.note) {
      formData.append(`fileUploads[${index}].note`, upload.note);
    }
  });

  const response = await axiosInstance.post(
    "/api/Tractor/create-with-files",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  clearCache(); // Clear cache when modifying a tractor
  return response;
};

export const deactivateTractor = async (id: string) => {
  try {
    const response = await axiosInstance.put(
      `/api/Tractor/deactivate-tractor/${id}`
    );
    clearCache(); // Clear cache when modifying a tractor
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const activateTractor = async (id: string) => {
  try {
    const response = await axiosInstance.put(
      `/api/Tractor/activate-tractor/${id}`
    );
    clearCache(); // Clear cache when modifying a tractor
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const updateTractorWithFiles = async (
  tractorId: string,
  tractorData: {
    licensePlate: string;
    brand: string;
    manufactureYear: number;
    maxLoadWeight: number;
    lastMaintenanceDate: string | null;
    nextMaintenanceDate: string;
    registrationDate: string;
    registrationExpirationDate: string;
    containerType: number;
  },
  newFiles: Array<{
    file: File;
    description: string;
    note?: string;
  }> = [],
  fileIdsToRemove: string[] = []
) => {
  const formData = new FormData();

  // Handle each field individually rather than using Object.entries
  formData.append("licensePlate", tractorData.licensePlate);
  formData.append("brand", tractorData.brand);
  formData.append("manufactureYear", tractorData.manufactureYear.toString());
  formData.append("maxLoadWeight", tractorData.maxLoadWeight.toString());
  formData.append("nextMaintenanceDate", tractorData.nextMaintenanceDate);
  formData.append("registrationDate", tractorData.registrationDate);
  formData.append(
    "registrationExpirationDate",
    tractorData.registrationExpirationDate
  );
  formData.append("containerType", tractorData.containerType.toString());

  // Only add lastMaintenanceDate if it's not null and not a default date
  if (
    tractorData.lastMaintenanceDate &&
    !tractorData.lastMaintenanceDate.includes("0001-01-01")
  ) {
    formData.append("lastMaintenanceDate", tractorData.lastMaintenanceDate);
  }

  newFiles.forEach((upload, index) => {
    formData.append(`newFiles[${index}].file`, upload.file);
    formData.append(`newFiles[${index}].description`, upload.description);
    if (upload.note) {
      formData.append(`newFiles[${index}].note`, upload.note);
    }
  });

  // Add file IDs to remove
  fileIdsToRemove.forEach((fileId, index) => {
    formData.append(`fileIdsToRemove[${index}]`, fileId);
  });

  const response = await axiosInstance.put(
    `/api/Tractor/${tractorId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  clearCache();
  return response.data;
};

export const updateTractorFileDetails = async (
  fileId: string,
  updateData: {
    description?: string;
    note?: string;
  }
) => {
  try {
    const response = await axiosInstance.put(
      `/api/Tractor/files/${fileId}`,
      updateData
    );
    clearCache();
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const getTractorUseHistory = async (
  tractorId: string,
  paginationParams: PaginationParams = { pageNumber: 1, pageSize: 5 }
) => {
  try {
    const params = new URLSearchParams();
    params.append("pageNumber", paginationParams.pageNumber.toString());
    params.append("pageSize", paginationParams.pageSize.toString());

    const response = await axiosInstance.get<TractorUseHistoryResponse>(
      `/api/Tractor/history/${tractorId}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tractor use history:", error);
    return {
      success: false,
      data: {
        tractorUseHistories: {
          items: [],
          currentPage: 1,
          totalPages: 0,
          pageSize: 5,
          totalCount: 0,
          hasPrevious: false,
          hasNext: false,
        },
      },
      message: "Error fetching tractor use history",
      messageVN: "Đã xảy ra lỗi khi tải lịch sử sử dụng đầu kéo",
      errors: null,
    };
  }
};
