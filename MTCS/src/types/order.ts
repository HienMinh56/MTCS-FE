export enum OrderStatus {
  Pending = "Pending",
  Scheduled = "Scheduled",
  Delivering = "Delivering",
  Shipped = "Shipped",
  Completed = "Completed",
  Canceled = "canceled"
}

export enum DeliveryType {
  Import = 1,
  Export = 2,
}

export enum ContainerType {
  "Container Khô" = 1,
  "Container Lạnh" = 2,
}

export enum ContainerSize {
  "Container 20 FEET" = 20,
  "Container 40 FEET" = 40,
}

export enum IsPay {
  Yes = 1,
  No = 0
}

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
  }

export interface OrderFile {
    fileId: string;
    orderId: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    uploadBy: string;
    description: string;
    note: string;
    modifiedDate: string | null;
    modifiedBy: string | null;  
    deletedDate: string | null;
    deletedBy: string | null;
    fileUrl: string;      
}

export interface Order {
  orderId: string;
  trackingCode: string;
  customerId: string;
  companyName: string;
  createdDate: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  totalAmount: number;
  isPay: IsPay | null; // Add this field
}

export interface OrderResponse {
  success: boolean;
  data: {
    orders: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalCount: number;
      hasPrevious: boolean;
      hasNext: boolean;
      items: Order[];
    };
    allCount: number;
    activeCount: number;
    maintenanceDueCount: number;
    registrationExpiryDueCount: number;
  };
  message: string;
  errors: string[] | null;
}

export interface OrderDetails {
    orderId: string;
    trackingCode: string;
    customerId: string;
    companyName: string;
    status: OrderStatus;
    note: string;
    createdDate: string;
    createdBy: string | null;
    modifiedDate: string | null;
    modifiedBy: string | null;
    contactPerson: string;
    contactPhone: string;
    orderPlacer: string;
    isPay: IsPay | null;
    totalAmount: number;
}

export interface OrderDetailsResponse {
  success: boolean;
  data: OrderDetails;
  message: string;
  errors: string[] | null;
}

export interface OrderDetailDetail {
  orderDetailId: string;
  orderId: string;
  containerNumber: string;
  containerType: ContainerType;
  completionTime: string;
  containerSize: ContainerSize
  weight: number;
  temperature: number;
  distance: number;
  pickUpLocation: string;
  deliveryLocation: string;
  conReturnLocation: string;
  pickUpDate: string;
  deliveryDate: string;
  status: OrderStatus;
  files: [OrderFile["fileUrl"]] | null;
}