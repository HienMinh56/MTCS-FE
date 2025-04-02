export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CustomerDetail {
  customerId: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  taxNumber: string;
  address: string;
  createdDate: string | null;
  createdBy: string | null;
  modifiedDate: string | null;
  modifiedBy: string | null;
  deletedDate: string | null;
  deletedBy: string | null;
  contracts: string[] | null;
  orders: string[] | null;
}

export interface Customer {
  customerId: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  createdDate: string | null;
  totalOrders: number;
}

export interface CustomerResponse {
  success: boolean;
  data: {
    orders: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalCount: number;
      hasPrevious: boolean;
      hasNext: boolean;
      items: Customer[];
    };
    allCount: number;
    activeCount: number;
    maintenanceDueCount: number;
    registrationExpiryDueCount: number;
  };
  message: string;
  errors: string[] | null;
}

export interface CustomerDetailsResponse {
  success: boolean;
  data: CustomerDetail;
  message: string;
  errors: string[] | null;
}
