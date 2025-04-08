import { tripRelace } from "../types/trip";
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
