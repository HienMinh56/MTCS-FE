import { CustomerResponse, CustomerDetailsResponse, Customer } from "../types/customer";
import axiosInstance from "../utils/axiosConfig";
import { ApiResponse } from "../types/api-types";

export const getCustomers = async (
  page: number = 1,
  pageSize: number = 10,
  searchKeyword?: string,
) => {
  try {
    const params = new URLSearchParams();

    params.append("pageNumber", page.toString());
    params.append("pageSize", pageSize.toString());

    if (searchKeyword) {
      params.append("searchKeyword", searchKeyword);
    }

    const response = await axiosInstance.get<any>(
      `/api/Customer?${params.toString()}`
    );
    
    console.log("API response:", response.data);
    
    // Handle the new format which has { status, message, data } structure
    if (response.data && response.data.status === 1) {
      // If data is an array, return it directly
      if (Array.isArray(response.data.data)) {
        return {
          orders: {
            items: response.data.data,
            totalCount: response.data.data.length,
            // Add other necessary properties
            currentPage: page,
            totalPages: 1,
            pageSize: pageSize,
            hasPrevious: false,
            hasNext: false,
          }
        };
      }
      // If it's in the old expected format
      else if (response.data.data && response.data.data.orders) {
        return response.data.data;
      }
    }
    
    // If there's no data or it doesn't match expected format, return empty result
    return {
      orders: {
        items: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 1,
        pageSize: pageSize,
        hasPrevious: false,
        hasNext: false,
      }
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const getCustomerById = async (customerId: string): Promise<Customer> => {
  try {
    const response = await axiosInstance.get<CustomerDetailsResponse>(
      `/api/Customer/${customerId}`
    );
    
    // Only treat as error if there's no data
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error("Failed to fetch customer details");
  } catch (error) {
    console.error(`Error fetching customer details for ID ${customerId}:`, error);
    throw error;
  }
};