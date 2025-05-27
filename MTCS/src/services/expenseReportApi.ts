import axiosInstance from "../utils/axiosConfig";
import { ExpenseReport } from "../types/expenseReport";

export const getExpenseReportByTrip = async (tripId: string) => {
    try {
        const response = await axiosInstance.get<ExpenseReport>(`/api/ExpenseReport/GetAllExpenseReports?tripId=${tripId}`);

        return response.data.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}