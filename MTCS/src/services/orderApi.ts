import {
  OrderDetails,
  OrderStatus,
  OrderResponse,
  OrderFile,
  ContainerType,
  ContainerSize,
  IsPay,
} from "../types/order";
import axiosInstance from "../utils/axiosConfig";
import { ApiResponse } from "../types/api-types";

export const getOrders = async (
  page: number,
  pageSize: number,
  searchKeyword?: string,
  status?: OrderStatus
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

    const response = await axiosInstance.get<OrderResponse>(
      `/api/order/orders?${params.toString()}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching tractors:", error);
    throw error;
  }
};

export const getOrderDetails = async (
  orderId: string
): Promise<OrderDetails> => {
  try {
    // Using query parameter instead of path parameter
    const response = await axiosInstance.get<ApiResponse<OrderDetails[]>>(
      `/api/order/orders`,
      {
        params: {
          orderId: orderId,
        },
      }
    );

    // Check if the response is successful
    if (
      response.data.status === 1 &&
      Array.isArray(response.data.data) &&
      response.data.data.length > 0
    ) {
      // Return the first order from the data array
      return response.data.data[0];
    }

    throw new Error(response.data.message || "No order found");
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  companyName: string;
  temperature: number | null; // Made nullable for Container Khô
  weight: number;
  pickUpDate: string;
  deliveryDate: string;
  note: string;
  containerType: ContainerType; // Now using updated ContainerType enum values
  containerSize: ContainerSize;
  deliveryType: number;
  pickUpLocation: string;
  deliveryLocation: string;
  conReturnLocation: string;
  price: number;
  contactPerson: string;
  contactPhone: string;
  distance: number | null;
  containerNumber: string;
  completeTime: string | null; // Added completeTime
  orderPlacer: string; // Fixed field name to match backend
  description: string[] | null;
  notes: string[] | null;
  files: File[] | null;
}) => {
  console.log("===== ORDER API REQUEST =====");
  console.log("Request URL:", "/api/order");
  console.log("Request data:", orderData);

  try {
    // Create FormData object
    const formData = new FormData();

    // Add orderRequest data as individual form fields
    Object.entries(orderData).forEach(([key, value]) => {
      // Skip files, description, and notes arrays as they need special handling
      if (key !== "files" && key !== "description" && key !== "notes") {
        // Handle orderPlacer field correctly - rename to match backend (OrderPlace)
        if (key === "orderPlacer") {
          if (value !== null && value !== undefined) {
            formData.append("orderPlace", value.toString());
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });

    // Check if we have files to upload
    if (orderData.files && orderData.files.length > 0) {
      // Ensure descriptions and notes arrays have same length as files
      const descriptions = orderData.description || [];
      const notes = orderData.notes || [];
      
      // Log the counts to help diagnose issues
      console.log("Files count:", orderData.files.length);
      console.log("Descriptions count:", descriptions.length);
      console.log("Notes count:", notes.length);
      
      // Add files to formData
      orderData.files.forEach((file, index) => {
        formData.append("files", file);
      });

      // Add descriptions - ensure we have enough for each file
      for (let i = 0; i < orderData.files.length; i++) {
        formData.append("descriptions", i < descriptions.length ? descriptions[i] : "");
      }

      // Add notes - ensure we have enough for each file
      for (let i = 0; i < orderData.files.length; i++) {
        formData.append("notes", i < notes.length ? notes[i] : "");
      }
    }

    // Log the actual form data entries
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${(pair[1] as File).name}` : pair[1]));
    }

    const response = await axiosInstance.post("/api/order", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("===== ORDER API RESPONSE =====");
    console.log("Status:", response.status);
    console.log("Response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("===== ORDER API ERROR =====");
    console.error("Error:", error);
    throw error;
  }
};

export const updateOrder = async (orderData: {
  orderId: string;
  status: OrderStatus;
  note: string;
  price: number;
  contactPerson: string;
  containerNumber: string;
  contactPhone: string;
  orderPlacer: string;  // Make sure orderPlacer is included here
  isPay: IsPay;
  temperature: number | null;
  description: string[] | null;
  notes: string[] | null;
  filesToRemove: string[] | null;
  filesToAdd: File[] | null;
}) => {
  console.log("===== ORDER API REQUEST =====");
  console.log("Request URL:", `/api/order/update/${orderData.orderId}`);
  console.log("Request data:", orderData);

  try {
    // Always use FormData for all scenarios to match backend [FromForm] attribute
    const formData = new FormData();
    
    // Add basic fields
    formData.append("orderId", orderData.orderId);
    formData.append("status", orderData.status.toString());
    formData.append("note", orderData.note || "");
    formData.append("price", orderData.price.toString());
    formData.append("contactPerson", orderData.contactPerson || "");
    formData.append("containerNumber", orderData.containerNumber || "");
    formData.append("contactPhone", orderData.contactPhone || "");
    formData.append("orderPlacer", orderData.orderPlacer || "");  // Ensure orderPlacer is sent
    formData.append("isPay", orderData.isPay.toString());
    
    // Only add temperature if it's not null
    if (orderData.temperature !== null) {
      formData.append("temperature", orderData.temperature.toString());
    }

    // Add description fields
    if (orderData.description && orderData.description.length > 0) {
      orderData.description.forEach((desc) => {
        formData.append("descriptions", desc);
      });
    }

    // Add notes fields
    if (orderData.notes && orderData.notes.length > 0) {
      orderData.notes.forEach((note) => {
        formData.append("notes", note);
      });
    }

    // Add files to remove
    if (orderData.filesToRemove && orderData.filesToRemove.length > 0) {
      orderData.filesToRemove.forEach((fileUrl) => {
        formData.append("fileIdsToRemove", fileUrl);
      });
    }

    // Add new files
    if (orderData.filesToAdd && orderData.filesToAdd.length > 0) {
      orderData.filesToAdd.forEach((file) => {
        formData.append("addedFiles", file);
      });
    }
    
    // Log form data entries for debugging
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${(pair[1] as File).name}` : pair[1]));
    }

    const response = await axiosInstance.put(
      `/api/order/update/${orderData.orderId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("===== ORDER API RESPONSE =====");
    console.log("Status:", response.status);
    console.log("Response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("===== ORDER API ERROR =====");
    console.error("Error:", error);
    throw error;
  }
};

export const exportExcel = async (inputData: {
  fromDate: string | null;
  toDate: string | null;
}) => {
  try {
    // Use params property for GET requests to send query parameters
    const response = await axiosInstance.get("/api/order/export-excel", {
      params: inputData,
      responseType: 'blob', // Set response type to blob for file downloads
    });
    
    // Create a URL for the blob
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date if not provided in response headers
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'orders-export.xlsx';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error("===== ORDER API ERROR =====");
    console.error("Error exporting Excel:", error);
    throw error;
  }
};