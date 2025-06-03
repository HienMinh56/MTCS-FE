import axiosInstance from "../utils/axiosConfig";
import { ExpenseReport } from "../types/expenseReport";

interface BusinessResult<T> {
  status: number;
  message: string;
  data: T;
}

export const getExpenseReportByTrip = async (
  tripId: string
): Promise<ExpenseReport[]> => {
  try {
    const response = await axiosInstance.get<BusinessResult<ExpenseReport[]>>(
      `/api/ExpenseReport/GetAllExpenseReports?tripId=${tripId}`
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getExpenseReportsList = async (): Promise<ExpenseReport[]> => {
  try {
    const response = await axiosInstance.get<BusinessResult<ExpenseReport[]>>(
      `/api/ExpenseReport/expense-list`
    );

    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getExpenseReportDetails = async (
  reportId: string
): Promise<ExpenseReport> => {
  try {
    const response = await axiosInstance.get<BusinessResult<ExpenseReport[]>>(
      `/api/ExpenseReport/GetExpenseReportDetails?reportId=${reportId}`
    );

    // The API returns an array with a single item
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    } else {
      throw new Error("No expense report found");
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
