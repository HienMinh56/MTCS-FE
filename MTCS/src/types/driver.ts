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

export interface DriverUseHistory {
  tripId: string;
  tractorId: string;
  tractorPlate: string;
  trailerId: string;
  trailerPlate: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  matchBy: string;
  matchTime: string | null;
}

export interface DriverUseHistoryPagedData {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: DriverUseHistory[];
}

export interface DriverUseHistoryResponse {
  driverUseHistories: DriverUseHistoryPagedData;
}

export enum DriverStatus {
  Inactive = 0,
  Active = 1,
  OnDuty = 2,
  OnFixing = 3,
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
    case DriverStatus.OnFixing:
      return "on_fixing";
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
    case DriverStatus.OnFixing:
      return "Đang khắc phục sự cố";
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
    case DriverStatus.OnFixing:
      return "warning"; // Orange/yellow for fixing status
    default:
      return "default";
  }
};

export interface DriverTripSchedule {
  tripId: string;
  trackingCode: string;
  orderDetailId: string;
  tractorId: string;
  tractorPlate: string;
  trailerId: string;
  trailerPlate: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  estimatedCompletionTime: string;
  deliveryDate: string;
}

export interface DailyWorkingTime {
  date: string;
  workingTime: string;
  totalMinutes: number;
  expectedWorkingTime: string;
  expectedMinutes: number;
}

export interface DriverTimeTableItem {
  driverId: string;
  driverName: string;
  driverSchedule: DriverTripSchedule[];
  totalCount: number;
  completedCount: number;
  deliveringCount: number;
  delayingCount: number;
  canceledCount: number;
  notStartedCount: number;
  weeklyWorkingTime: string;
  totalWeeklyMinutes: number;
  expectedWeeklyWorkingTime: string;
  expectedWeeklyMinutes: number;
  dailyWorkingTimes: DailyWorkingTime[];
}

export interface DriverTimeTableResponse {
  success: boolean;
  data: DriverTimeTableItem[];
  message: string;
  messageVN: string | null;
  errors: any | null;
}
