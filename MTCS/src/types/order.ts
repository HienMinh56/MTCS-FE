export enum OrderStatus {
  Pending = "Pending",
  Scheduled = "Scheduled",
  Delivering = "Delivering",
  Shipped = "Shipped",
  Complete = "Complete",
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
  "Container 20 FT" = 20,
  "Container 40 FT" = 40,
}

export enum IsPay {
  Yes = 1,
  No = 2
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
  deliveryDate: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  price: number;
  distance: number | null;
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
    temperature: number;
    weight: string;
    pickUpDate: string;
    deliveryDate: string;
    status: OrderStatus;
    note: string;
    createdDate: string;
    createdBy: string | null;
    modifiedDate: string | null;
    modifiedBy: string | null;
    containerType: ContainerType;
    pickUpLocation: string;
    deliveryLocation: string;
    conReturnLocation: string;
    deliveryType: DeliveryType;
    price: number;
    containerNumber: string;
    contactPerson: string;
    contactPhone: string;
    orderPlacer: string;
    distance: number | null;
    containerSize: ContainerSize;
    orderFiles: [OrderFile["fileUrl"]] | null;
    completeTime: string | null;
}

export interface OrderDetailsResponse {
  success: boolean;
  data: OrderDetails;
  message: string;
  errors: string[] | null;
}