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
