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

export interface PriceTablesHistoryDTO {
  priceTables: PriceTable[];
  availableVersions: number[];
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
