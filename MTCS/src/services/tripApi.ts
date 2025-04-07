import { tripRelace } from "../types/trip";
import axiosInstance from "../utils/axiosConfig";

export const createTripReplace = async (tripData: tripRelace) => {
  // Enhanced logging to help debug the API request
  console.log("===== TRIP API REQUEST DATA =====");
  console.log("FormData keys:", tripData);

  const response = await axiosInstance.post(`api/trips/update/${tripData.tripId}`, tripData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
