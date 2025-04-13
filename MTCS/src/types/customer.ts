export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Customer {
  customerId: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  taxNumber?: string;
  address?: string;
  contactPerson?: string;
  createdDate?: string;
  createdBy?: string;
  modifiedDate?: string;
  modifiedBy?: string;
  deletedDate?: string | null;
  deletedBy?: string | null;
  contracts?: any[];
  orders?: any[];
}

export interface CustomerDetail extends Customer {}

export interface Order {
  orderId: string;
  trackingCode: string;
  customerId: string;
  temperature: number | null;
  weight: number | null;
  pickUpDate: string | null;
  deliveryDate: string | null;
  status: string;
  note: string | null;
  createdDate: string | null;
  createdBy: string | null;
  modifiedDate: string | null;
  modifiedBy: string | null;
  containerType: number | null;
  pickUpLocation: string | null;
  deliveryLocation: string | null;
  conReturnLocation: string | null;
  deliveryType: number | null;
  price: number;
  containerNumber: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  orderPlacer: string | null;
  distance: number | null;
  containerSize: number | null;
  isPay: number | null;
  completionTime: string | null;
  customer: any | null;
  orderFiles: any[];
  trips: any[];
}

export interface Contract {
  contractId: string;
  customerId: string;
  startDate: string | null;
  endDate: string | null;
  status: number;
  createdDate: string | null;
  createdBy: string | null;
  summary: string | null;
  signedTime: string | null;
  signedBy: string | null;
  contractFiles: any[];
  customer: any | null;
}

export interface CustomerResponse {
  status: number;
  message: string;
  data: CustomerDetail[];
}

export interface CustomerDetailsResponse {
  status: number;
  message: string;
  data: CustomerDetail[];
}
