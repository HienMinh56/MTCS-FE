import { tripRelace, trip, TripTimeTableResponse } from "../types/trip";
import axiosInstance from "../utils/axiosConfig";

export const createTripReplace = async (tripData: tripRelace) => {
  // Enhanced logging to help debug the API request
  console.log("===== TRIP API REQUEST DATA =====");
  console.log("Trip Request Data:", tripData);

  // Create FormData object to match [FromForm] in the controller
  const formData = new FormData();

  // Add each property to the FormData object with correct casing
  formData.append("TripId", tripData.tripId);

  // Only append non-null values
  if (tripData.driverId) {
    formData.append("DriverId", tripData.driverId);
  }

  if (tripData.tractorId) {
    formData.append("TractorId", tripData.tractorId);
  }

  if (tripData.trailerId) {
    formData.append("TrailerId", tripData.trailerId);
  }

  // Log the form data keys for debugging
  console.log(
    "Form Data keys:",
    [...formData.entries()].map((entry) => entry[0])
  );

  // Send as multipart/form-data
  const response = await axiosInstance.put(
    `api/trips/update/${tripData.tripId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getAllTrip = async () => {
  try {
    const response = await axiosInstance.get<trip[] | trip>("/api/trips");

    // Check if response has a data property that's an array (typical API wrapper format)
    if (response.data && (response.data as any).data) {
      return (response.data as any).data; // Return the whole array
    }

    // If the response is already an array, return it directly
    if (response.data && Array.isArray(response.data)) {
      return response.data; // Return the whole array
    }

    // If it's a single trip, wrap it in an array for consistent handling
    return [response.data];
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
};

export const getTrip = async (trackingCode: string) => {
  try {
    const response = await axiosInstance.get<trip[] | trip>(
      `/api/trips?trackingCode=${trackingCode}`
    );

    // Check if response has a data property that's an array (typical API wrapper format)
    if (response.data && (response.data as any).data) {
      return (response.data as any).data; // Return the whole array
    }

    // If the response is already an array, return it directly
    if (response.data && Array.isArray(response.data)) {
      return response.data; // Return the whole array
    }

    // If it's a single trip, wrap it in an array for consistent handling
    return [response.data];
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
};

export const getTripDetail = async (tripId: string) => {
  try {
    const response = await axiosInstance.get<trip>(
      `/api/trips?tripId=${tripId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
};

export const manualCreateTrip = async (tripData: {
  orderDetailId: string;
  driverId: string;
  tractorId: string;
  TrailerId: string;
}) => {
  try {
    const response = await axiosInstance.post("/api/trips", tripData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Create trip fail with error", error);
    throw error;
  }
};

export const autoScheduleTrip = async (orderDetailId: string | null) => {
  try {
    const formData = new FormData();
    if (orderDetailId) {
      formData.append("orderDetailId", orderDetailId);
    }

    const response = await axiosInstance.post(
      "/api/trips/auto-schedule",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Return the complete response object with status, message, and data
    return response.data;
  } catch (error: any) {
    console.error("Failed to auto schedule trip", error);
    // Extract error message from the API response if available
    if (error.response && error.response.data) {
      throw error.response.data; // This will contain status, message, etc.
    }
    throw error;
  }
};

export const CancelTrip = async (data: { tripId: string; note: string }) => {
  try {
    const formData = new FormData();

    formData.append("tripId", data.tripId);
    formData.append("note", data.note);

    const response = await axiosInstance.put("/api/trips/cancel", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the complete response object with status, message, and data
    return response.data;
  } catch (error: any) {
    console.error("Failed to cancel trip", error);
    // Extract error message from the API response if available
    if (error.response && error.response.data) {
      throw error.response.data; // This will contain status, message, etc.
    }
    throw error;
  }
};

export const getTripForTable = async () => {
  try {
    const response = await axiosInstance.get<trip[] | trip>(
      "/api/trips/getAll"
    );

    // Check if response has a data property that's an array (typical API wrapper format)
    if (response.data && (response.data as any).data) {
      return (response.data as any).data; // Return the whole array
    }

    // If the response is already an array, return it directly
    if (response.data && Array.isArray(response.data)) {
      return response.data; // Return the whole array
    }

    // If it's a single trip, wrap it in an array for consistent handling
    return [response.data];
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
};

export const getTripTimeTable = async (startOfWeek: Date, endOfWeek: Date) => {
  try {
    const response = await axiosInstance.get<TripTimeTableResponse>(
      `/api/trips/time-table`,
      {
        params: {
          startOfWeek: startOfWeek.toISOString(),
          endOfWeek: endOfWeek.toISOString(),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching trip time table:", error);
    throw error;
  }
};
