import axiosInstance from '../utils/axiosConfig';

export const fetchDeliveryStatuses = async () => {
  try {
    const response = await axiosInstance.get('/api/delivery-statuses');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching delivery statuses:', error);
    throw error;
  }
};

export interface UpdateDeliveryStatusPayload {
  statusId: string;
  statusName: string;
  isActive: number;
  statusIndex: number;
}

export const updateDeliveryStatuses = async (statuses: UpdateDeliveryStatusPayload[]) => {
  try {
    const response = await axiosInstance.post('/api/delivery-statuses', statuses);
    return response.data;
  } catch (error) {
    console.error('Error updating delivery statuses:', error);
    throw error;
  }
};