export enum TractorStatus {
  Active = "Active",
  Inactive = "Inactive",
  OnDuty = "OnDuty",
  Onfixing = "Onfixing",
  Detained = "Detained",
}

export enum ContainerType {
  DryContainer = 1,
  ReeferContainer = 2,
}

export interface Tractor {
  tractorId: string;
  licensePlate: string;
  brand: string;
  status: TractorStatus;
  nextMaintenanceDate: string;
  registrationExpirationDate: string;
  containerType: ContainerType;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TractorResponse {
  success: boolean;
  data: {
    tractors: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalCount: number;
      hasPrevious: boolean;
      hasNext: boolean;
      items: Tractor[];
    };
    allCount: number;
    activeCount: number;
    maintenanceDueCount: number;
    registrationExpiryDueCount: number;
  };
  message: string;
  errors: string[] | null;
}

export interface TractorFileDTO {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  note?: string;
  uploadDate: string;
  uploadBy: string;
}

export interface TractorDetails {
  tractorId: string;
  licensePlate: string;
  brand: string;
  manufactureYear: number;
  maxLoadWeight: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  registrationDate: string;
  registrationExpirationDate: string;
  status: TractorStatus;
  containerType: ContainerType;
  orderCount: number;
  createdDate: string;
  createdBy: string | null;
  modifiedDate: string | null;
  modifiedBy: string | null;
  deletedDate: string | null;
  deletedBy: string | null;
  files: TractorFileDTO[];
}

export interface TractorDetailsResponse {
  success: boolean;
  data: TractorDetails;
  message: string;
  errors: string[] | null;
}

export interface TractorUseHistory {
  tripId: string;
  driverId: string;
  driverName: string;
  trailerId: string;
  trailerPlate: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  matchBy: string;
  matchTime: string;
}

export interface TractorUseHistoryResponse {
  success: boolean;
  data: {
    tractorUseHistories: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalCount: number;
      hasPrevious: boolean;
      hasNext: boolean;
      items: TractorUseHistory[];
    };
  };
  message: string;
  messageVN: string;
  errors: string[] | null;
}
