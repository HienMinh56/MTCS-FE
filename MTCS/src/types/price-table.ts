export interface PriceTable {
  priceId: string;
  minKm: number;
  maxKm: number;
  containerSize: number;
  containerType: number;
  minPricePerKm: number;
  maxPricePerKm: number;
  status: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  deliveryType: number;
  version: number;
}

export interface PriceChangeGroup {
  containerSize: number;
  containerType: number;
  deliveryType: number;
  minKm: number;
  maxKm: number;
  changes: PriceTable[];
}

export interface VersionInfo {
  version: number;
  startDate: string | null;
  endDate: string | null;
}

export interface PriceTablesHistoryDTO {
  priceTables: PriceTable[];
  versionsInfo: VersionInfo[];
  currentVersion: number;
  activeVersion: number;
  totalCount: number;
}

export interface PriceTableResponse {
  success: boolean;
  data: PriceTablesHistoryDTO;
  message: string;
  messageVN: string;
  errors: any;
}

export interface PriceChangesResponse {
  success: boolean;
  data: PriceChangeGroup[];
  message: string;
  messageVN: string;
  errors: any;
}

export interface UpdatePriceTableRequest {
  priceId: string;
  minPricePerKm?: number;
  maxPricePerKm?: number;
}

export interface ApiResponse {
  success: boolean;
  data: any;
  message: string;
  messageVN: string;
  errors: any;
}

export const ContainerSizeMap: Record<number, string> = {
  1: "20'",
  2: "40'",
};

export const ContainerTypeMap: Record<number, string> = {
  1: "Khô",
  2: "Lạnh",
};

export const DeliveryTypeMap: Record<number, string> = {
  1: "Nhập",
  2: "Xuất",
};

export const StatusMap: Record<number, string> = {
  0: "Không hoạt động",
  1: "Đang hoạt động",
};
