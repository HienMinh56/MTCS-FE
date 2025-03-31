export enum OrderStatus {
  Valid = 1,
  Invalid = 2
}

export enum ContractStatus {
  Active = 1,
  Inactive = 0,
}

export interface ContractFile {
  fileId: string;
  contractId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  uploadBy: string;
  status: OrderStatus;
  description: string;
  note: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  deletedDate: string | null;
  deletedBy: string | null;
  fileUrl: string;
}