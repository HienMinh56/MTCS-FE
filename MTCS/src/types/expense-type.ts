export interface ExpenseType {
  reportTypeId: string;
  reportType: string;
  isActive: number;
  createdBy: string;
  createdDate: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  expenseReports: any[];
}

export interface ExpenseTypeResponse {
  status: number;
  message: string;
  data: ExpenseType[];
}

// Request types for create and update operations
export interface CreateExpenseReportTypeRequest {
  reportTypeId?: string;
  reportType?: string;
  isActive?: number;
}

export interface UpdateExpenseReportTypeRequest {
  reportTypeId?: string;
  reportType?: string;
  isActive?: number;
}
