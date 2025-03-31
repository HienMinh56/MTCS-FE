import {
  OrderDetails,
  OrderStatus,
  OrderResponse,
  OrderFile,
} from "../types/order";
import axiosInstance from "../utils/axiosConfig";
import { ApiResponse } from "../types/api-types";

export const getOrders = async (
  page: number,
  pageSize: number,
  searchKeyword?: string,
  status?: OrderStatus,
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

export const getOrderDetails = async (orderId: string): Promise<OrderDetails> => {
  try {
    // Using query parameter instead of path parameter
    const response = await axiosInstance.get<ApiResponse<OrderDetails[]>>(`/api/order/orders`, {
      params: {
        orderId: orderId
      }
    });
    
    // Check if the response is successful
    if (response.data.status === 1 && 
        Array.isArray(response.data.data) && 
        response.data.data.length > 0) {
      // Return the first order from the data array
      return response.data.data[0];
    } 
    
    throw new Error(response.data.message || 'No order found');
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  companyName: string;
  temperature: number;
  weight: number;
  pickUpDate: string;
  deliveryDate: string;
  note: string;
  containerType: number;
  deliveryType: number;
  pickUpLocation: string;
  deliveryLocation: string;
  conReturnLocation: string;
  price: number;
  contactPerson: string;
  contactPhone: string;
  distance: number | null;
  orderPlacer: string;
  containerNumber: string;
  description: string[] | null;
  notes: string[] | null;
  files: File[] | null;
}) => {
  console.log('===== ORDER API REQUEST =====');
  console.log('Request URL:', '/api/order');
  console.log('Request data:', orderData);
  
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Add orderRequest data as individual form fields
    Object.entries(orderData).forEach(([key, value]) => {
      // Skip files, description, and notes arrays as they need special handling
      if (key !== 'files' && key !== 'description' && key !== 'notes') {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Add descriptions and notes if they exist
    if (orderData.description && orderData.description.length > 0) {
      orderData.description.forEach((desc, index) => {
        formData.append('descriptions', desc);
      });
    }
    
    if (orderData.notes && orderData.notes.length > 0) {
      orderData.notes.forEach((note, index) => {
        formData.append('notes', note);
      });
    }
    
    // Add files if they exist
    if (orderData.files && orderData.files.length > 0) {
      orderData.files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      // Ensure we have matching descriptions and notes for each file
      // If not provided, add empty ones to match the number of files
      const descCount = orderData.description?.length || 0;
      const notesCount = orderData.notes?.length || 0;
      const fileCount = orderData.files.length;
      
      // Add empty descriptions if needed
      for (let i = descCount; i < fileCount; i++) {
        formData.append('descriptions', '');
      }
      
      // Add empty notes if needed
      for (let i = notesCount; i < fileCount; i++) {
        formData.append('notes', '');
      }
    }
    
    console.log('FormData prepared with:', 
      'Order fields',
      'Files count:', orderData.files?.length || 0,
      'Descriptions count:', orderData.description?.length || 0,
      'Notes count:', orderData.notes?.length || 0
    );
    
    const response = await axiosInstance.post(
      "/api/order",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('===== ORDER API RESPONSE =====');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('===== ORDER API ERROR =====');
    console.error('Error:', error);
    throw error;
  }
};