import axiosInstance from "../utils/axiosConfig";

export const getDeliveryStatus = async () => {
    try {
        const response = await axiosInstance.get("/api/delivery-statuses");
        return response.data;
    }
    catch (error) {
        console.error("Failed to get delivery status", error);
        throw error;
    }
}