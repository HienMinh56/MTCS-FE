import axiosInstance from "../utils/axiosConfig";
import {
  PriceTableResponse,
  PriceChangesResponse,
  UpdatePriceTableRequest,
  ApiResponse,
} from "../types/price-table";
import { formatApiError } from "../utils/errorFormatting";

export const getPriceTables = async (
  version?: number | null
): Promise<PriceTableResponse> => {
  try {
    let url = "/api/price-tables/get-list";

    if (version !== undefined && version !== null) {
      url += `?version=${version}`;
    }

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
};

export const getPriceChangesInVersion = async (
  version: number
): Promise<PriceChangesResponse> => {
  try {
    const response = await axiosInstance.get(
      `/api/price-tables/price-changes/${version}`
    );

    // Make sure we always return a successful response for empty price changes
    if (
      response.data &&
      !response.data.success &&
      (response.data.messageVN?.includes("Không tìm thấy thay đổi giá") ||
        response.data.message?.includes("No price changes found"))
    ) {
      return {
        success: true,
        data: [],
        message: "No price changes found",
        messageVN: "Không có thay đổi giá trong phiên bản này",
        errors: null,
      };
    }

    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
};

export const updatePriceTables = async (
  priceTable: UpdatePriceTableRequest
): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put("/api/price-tables", priceTable);
    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
};

export const importPriceTable = async (file: File): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append("excelFile", file);

    const response = await axiosInstance.post(
      "/api/price-tables/excel",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
};

export const downloadPriceTableTemplate = async (): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(
      "/api/price-tables/download-template",
      {
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
};
