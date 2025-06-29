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
  try {
    // Make the API request
    const response = await axiosInstance.post("/api/Customer", customerData, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    // Check if response itself contains an error status
    if (response.data && response.data.status === 400) {
      console.error("Server returned 400 status in response body:", response.data);
      
      // Handle the error based on the message in the response
      const errorMessage = response.data.message || "Lỗi dữ liệu không hợp lệ";
      
      if (errorMessage.includes("Phone number already exists")) {
        throw new Error("Số điện thoại đã được sử dụng bởi khách hàng khác");
      } else if (errorMessage.includes("Tax number already exists")) {
        throw new Error("Mã số thuế đã được sử dụng bởi khách hàng khác");
      } else {
        throw new Error(errorMessage);
      }
    }
    
    // If we've gotten this far, the response is successful
    return response.data;
  } catch (error: any) {
    console.error("===== createCustomer API ERROR =====");
    console.error("Error:", error);
    
    // Handle axios error response
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      // Handle HTTP 400 error
      if (error.response.status === 400) {
        const errorData = error.response.data;
        
        // Extract error message from different possible formats
        let errorMessage = "Lỗi dữ liệu không hợp lệ";
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        // Translate common error messages
        if (errorMessage.includes("Phone number already exists")) {
          throw new Error("Số điện thoại đã được sử dụng bởi khách hàng khác");
        } else if (errorMessage.includes("Tax number already exists")) {
          throw new Error("Mã số thuế đã được sử dụng bởi khách hàng khác");
        } else {
          throw new Error(errorMessage);
        }
      }
    }
    
    // If error doesn't have a response or isn't a 400 status
    if (error.message) {
      throw error; // Rethrow the error with its message
    } else {
      throw new Error("Lỗi khi tạo khách hàng. Vui lòng thử lại sau.");
    }
  }
};

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
    
    console.log("Update response raw:", response);
    
    // IMPORTANT: Check if response body contains an error status code
    // This handles cases where the API returns HTTP 200 but the response body contains an error
    if (response.data && (response.data.status === 400 || response.data.status === 0)) {
      console.error("Server returned error status in response body:", response.data);
      
      // Extract error message from different possible formats
      let errorMessage = response.data.message || "Lỗi dữ liệu không hợp lệ";
      
      // Translate common error messages
      if (errorMessage.toLowerCase().includes("phone number already exists")) {
        throw new Error("Số điện thoại đã được sử dụng bởi khách hàng khác");
      } else if (errorMessage.toLowerCase().includes("tax number already exists")) {
        throw new Error("Mã số thuế đã được sử dụng bởi khách hàng khác");
      } else if (errorMessage.toLowerCase().includes("email already exists")) {
        throw new Error("Email đã được sử dụng bởi khách hàng khác");
      } else {
        throw new Error(errorMessage);
      }
    }
    
    console.log("Update response success:", response.data);
    return response.data;
  }
  catch (error: any) {
    console.error("===== updateCustomer API ERROR =====");
    console.error("Error:", error);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      // Extract error message from different possible formats
      let errorMessage = "Lỗi cập nhật dữ liệu";
      const errorData = error.response.data;
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.title) {
        errorMessage = errorData.title;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.errors) {
        // Handle validation errors array
        const errors = Object.values(errorData.errors).flat();
        if (errors.length > 0) {
          errorMessage = errors[0] as string;
        }
      }
      
      // Handle HTTP 400 error for validation failures
      if (error.response.status === 400) {
        // Translate common error messages
        const lowerCaseError = errorMessage.toLowerCase();
        if (lowerCaseError.includes("phone number already exists")) {
          throw new Error("Số điện thoại đã được sử dụng bởi khách hàng khác");
        } else if (lowerCaseError.includes("tax number already exists")) {
          throw new Error("Mã số thuế đã được sử dụng bởi khách hàng khác");
        } else if (lowerCaseError.includes("email already exists")) {
          throw new Error("Email đã được sử dụng bởi khách hàng khác");
        } else {
          throw new Error(errorMessage);
        }
      } else if (error.response.status === 409) {
        // Conflict errors (often used for duplicates)
        const errorData = error.response.data;
        let errorMessage = "Dữ liệu bị trùng lặp";
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        
        // Check for specific duplication messages
        const lowerCaseError = errorMessage.toLowerCase();
        if (lowerCaseError.includes("phone")) {
          throw new Error("Số điện thoại đã được sử dụng bởi khách hàng khác");
        } else if (lowerCaseError.includes("tax")) {
          throw new Error("Mã số thuế đã được sử dụng bởi khách hàng khác");
        } else if (lowerCaseError.includes("email")) {
          throw new Error("Email đã được sử dụng bởi khách hàng khác");
        } else {
          throw new Error(errorMessage);
        }
      }
    }
    
    // If error doesn't have a response or isn't a 400/409 status
    if (error.message) {
      throw error; // Rethrow the error with its message
    } else {
      throw new Error("Lỗi khi cập nhật khách hàng. Vui lòng thử lại sau.");
    }
  }
};

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
};