export interface ExpenseReportFile {
  fileId: string;
  reportId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  uploadBy: string;
  description: string;
  note: string;
  deletedDate: string | null;
  deletedBy: string | null;
  fileUrl: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
}

export interface ExpenseReport {
  reportId: string;
  tripId: string;
  reportTypeId: string;
  cost: number;
  location: string;
  reportTime: string;
  reportBy: string;
  isPay: number; // 0 for false, 1 for true
  description: string;
  expenseReportFiles: ExpenseReportFile[];
}

export interface ExpenseReportType {
  reportTypeId: string;
  reportType: string;
  isActive: number; // 0 for false, 1 for true
  createdBy: string;
  createdDate: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  expenseReports: ExpenseReport[];
}