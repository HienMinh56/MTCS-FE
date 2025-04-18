import axiosInstance from "../utils/axiosConfig";
import { PriceTableResponse } from "../types/price-table";
import { formatApiError } from "../utils/errorFormatting";

export const getPriceTables = async (
  version?: number
): Promise<PriceTableResponse> => {
  try {
    let url = "/api/price-tables/get-list";

    if (version !== undefined) {
      url += `?version=${version}`;
    }

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw formatApiError(error);
  }
};
