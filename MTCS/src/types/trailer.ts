export enum TrailerStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export interface Trailer {
  trailerId: string;
  licensePlate: string;
  brand: string;
  status: TrailerStatus;
  nextMaintenanceDate: string;
  registrationExpirationDate: string;
  containerSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TrailerResponse {
  success: boolean;
  data: {
    trailers: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalCount: number;
      hasPrevious: boolean;
      hasNext: boolean;
      items: Trailer[];
    };
    allCount: number;
    activeCount: number;
    maintenanceDueCount: number;
    registrationExpiryDueCount: number;
  };
  message: string;
  errors: string[] | null;
}

export interface TrailerDetails {
  trailerId: string;
  licensePlate: string;
  brand: string;
  manufactureYear: number;
  maxLoadWeight: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  registrationDate: string;
  registrationExpirationDate: string;
  status: TrailerStatus;
  containerSize: number;
  orderCount: number;
  createdDate: string;
  createdBy: string | null;
  modifiedDate: string | null;
  modifiedBy: string | null;
  deletedDate: string | null;
  deletedBy: string | null;
}

export interface TrailerDetailsResponse {
  success: boolean;
  data: TrailerDetails;
  message: string;
  errors: string[] | null;
}
