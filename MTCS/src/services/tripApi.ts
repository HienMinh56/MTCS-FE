import { tripRelace, trip } from "../types/trip";
import axiosInstance from "../utils/axiosConfig";

export const createTripReplace = async (tripData: tripRelace) => {
  // Enhanced logging to help debug the API request
  console.log("===== TRIP API REQUEST DATA =====");
  console.log("Trip Request Data:", tripData);
  
  // Create FormData object to match [FromForm] in the controller
  const formData = new FormData();
  
  // Add each property to the FormData object with correct casing
  formData.append('TripId', tripData.tripId);
  
  // Only append non-null values
  if (tripData.driverId) {
    formData.append('DriverId', tripData.driverId);
  }
  
  if (tripData.tractorId) {
    formData.append('TractorId', tripData.tractorId);
  }
  
  if (tripData.trailerId) {
    formData.append('TrailerId', tripData.trailerId);
  }
  
  // Log the form data keys for debugging
  console.log("Form Data keys:", [...formData.entries()].map(entry => entry[0]));

  // Send as multipart/form-data
  const response = await axiosInstance.put(`api/trips/update/${tripData.tripId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getTrip = async (orderId: string) => {
  try {
    const response = await axiosInstance.get<trip[] | trip>(
      `/api/trips?orderId=${orderId}`
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
  }
  catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
};

export const getTripDetail = async (tripId: string) => {
  try {
    const response = await axiosInstance.get<trip>(`/api/trips?tripId=${tripId}`);
    
    return response.data;
  }
  catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
}