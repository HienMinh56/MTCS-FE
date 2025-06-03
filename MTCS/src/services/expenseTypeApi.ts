import axiosConfig from "../utils/axiosConfig";
import {
  ExpenseTypeResponse,
  CreateExpenseReportTypeRequest,
  UpdateExpenseReportTypeRequest,
} from "../types/expense-type";

export const expenseTypeApi = {
  getAllExpenseTypes: async (): Promise<ExpenseTypeResponse> => {
    try {
      const response = await axiosConfig.get(
        "/api/ExpenseReportType/GetAllExpenseReportTypes"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching expense types:", error);
      throw error;
    }
  },

  createExpenseType: async (
    data: CreateExpenseReportTypeRequest
  ): Promise<ExpenseTypeResponse> => {
    try {
      const response = await axiosConfig.post(
        "/api/ExpenseReportType/CreateExpenseReportType",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating expense type:", error);
      throw error;
    }
  },

  updateExpenseType: async (
    data: UpdateExpenseReportTypeRequest
  ): Promise<ExpenseTypeResponse> => {
    try {
      const response = await axiosConfig.put(
        "/api/ExpenseReportType/UpdateExpenseReportType",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating expense type:", error);
      throw error;
    }
  },
};
