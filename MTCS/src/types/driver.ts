export interface DriverFile {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  description?: string;
  note?: string;
  uploadDate: string;
  uploadBy: string;
}

export interface Driver {
  driverId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: DriverStatus;
  totalKm?: number;
  createdDate?: string;
  dateOfBirth?: string | null;
  modifiedDate?: string | null;
  totalWorkingTime?: number;
  currentWeekWorkingTime?: string;
  currentWeekHours?: number;
  dailyWorkingTime?: string;
  totalOrder?: number;
  createdBy?: string | null;
  modifiedBy?: string | null;
  files?: DriverFile[];
}

export enum DriverStatus {
  Inactive = 0,
  Active = 1,
  OnDuty = 2,
}

export interface PaginatedData<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

export interface DriverListParams {
  pageNumber?: number;
  pageSize?: number;
  status?: DriverStatus | null;
  keyword?: string | null;
}

export const getDriverStatusText = (status: DriverStatus): string => {
  switch (status) {
    case DriverStatus.Inactive:
      return "inactive";
    case DriverStatus.Active:
      return "active";
    case DriverStatus.OnDuty:
      return "on_duty";
    default:
      return "unknown";
  }
};

export const getDriverStatusVietnamese = (status: DriverStatus): string => {
  switch (status) {
    case DriverStatus.Active:
      return "Đang hoạt động";
    case DriverStatus.Inactive:
      return "Không hoạt động";
    case DriverStatus.OnDuty:
      return "Đang vận chuyển";
    default:
      return "Không xác định";
  }
};

export const getDriverStatusColor = (
  status: DriverStatus
): "success" | "error" | "warning" | "primary" | "default" => {
  switch (status) {
    case DriverStatus.Active:
      return "success";
    case DriverStatus.Inactive:
      return "error";
    case DriverStatus.OnDuty:
      return "primary"; // Changed from warning to primary (blue)
    default:
      return "default";
  }
};
