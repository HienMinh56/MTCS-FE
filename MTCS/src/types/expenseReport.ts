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
  report?: any | null;
}

export interface Driver {
  driverId: string;
  driverName: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  isActive: number;
  createdBy: string;
  createdDate: string;
  modifiedBy: string | null;
  modifiedDate: string | null;
}

export interface OrderDetail {
  orderDetailId: string;
  orderId: string;
  trackingCode: string;
  // Add other fields as needed
}

export interface Trip {
  tripId: string;
  orderDetailId: string;
  driverId: string;
  tractorId: string;
  trailerId: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  matchType: number;
  matchBy: string;
  matchTime: string;
  note: string | null;
  deliveryReports: any[];
  driver: Driver | null;
  expenseReports: (ExpenseReport | null)[];
  incidentReports: any[];
  orderDetail: OrderDetail | null;
  tractor: any | null;
  trailer: any | null;
  tripStatusHistories: any[];
}

export interface ExpenseReport {
  reportId: string;
  tripId: string;
  reportTypeId: string;
  reportTypeName: string;
  cost: number;
  location: string;
  reportTime: string;
  reportBy: string;
  isPay: number; // 0 for false, 1 for true
  description: string | null;
  driverId: string;
  driverName: string | null;
  orderDetailId: string;
  trackingCode: string | null;
  expenseReportFiles: ExpenseReportFile[];
  reportType?: any | null;
  trip?: Trip | null;
  driver?: Driver | null;
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
