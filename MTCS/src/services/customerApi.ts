import { CustomerResponse, CustomerDetailsResponse, CustomerDetail } from "../types/customer";
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
    
    console.log("Customer API response:", response.data);
    
    // Xử lý phản hồi dựa trên định dạng thực tế
    if (Array.isArray(response.data)) {
      // Trường hợp API trả về array trực tiếp
      return response.data;
    } else if (response.data && response.data.status === 1 && Array.isArray(response.data.data)) {
      // Trường hợp API trả về định dạng { status, message, data }
      return response.data.data;
    } else if (response.data && response.data.status === 1 && response.data.data && response.data.data.orders) {
      // Trường hợp API trả về định dạng { status, message, data: { orders } }
      return response.data.data.orders.items;
    }
    
    // Trường hợp không xác định được định dạng phản hồi
    return [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const getCustomerById = async (
  customerId: string
): Promise<CustomerDetail> => {
  try {
    const response = await axiosInstance.get<CustomerDetailsResponse>(
      `/api/Customer?customerId=${customerId}`
    );

    console.log("Customer detail API response:", response.data);

    if (response.data.status === 1 && Array.isArray(response.data.data)) {
      if (response.data.data.length > 0) {
        return response.data.data[0]; // lấy phần tử đầu tiên
      } else {
        throw new Error("No customer found");
      }
    }

    throw new Error(response.data.message || "Failed to fetch customer details");
  } catch (error) {
    console.error(`Error fetching customer details for ID ${customerId}:`, error);
    throw error;
  }
};

export const createCustomer = async (customerData: {
  companyName: string;
  email: string;
  phoneNumber: string;
  taxNumber: string;
  address: string;
}) => {
    const response = await axiosInstance.post("/api/Customer", customerData, {
      headers: {
        "Content-Type": "application/json"
      }
    })

    return response.data;
}

export const updateCustomer = async (customerData: {
  cusId: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  taxNumber: string;
  address: string;
}) => {
  try {
    const { cusId, ...updateData } = customerData;
    
    console.log("Updating customer with ID:", cusId);
    console.log("Update data:", updateData);
    
    const response = await axiosInstance.put(
      `/api/Customer/${cusId}`, 
      updateData,
      {
        headers: {
          "Content-Type": "application/json"
        },
      }
    );
    
    console.log("Update response:", response.data);
    return response.data;
  }
  catch (error: any) {
    console.error("===== customer API ERROR =====");
    console.error("Error:", error);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      // If we have a specific error message from the backend, throw it
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error;
  }
}

export const deleteCustomer = async (customerId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/api/Customer/${customerId}`
    );

    return response.data;
  }
  catch (error) {
    console.error("Delete Customer Fail with Error", error);
    throw error;
  }
}