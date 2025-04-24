export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export enum UserRole {
  Admin = 1,
  Staff = 2,
  Customer = 3,
}

export enum UserStatus {
  Inactive = 0,
  Active = 1,
}

export enum Gender {
  Male = 1, // Updated to match backend enum values (Male = 1)
  Female = 2, // Updated to match backend enum values (Female = 2)
}

export interface InternalUser {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  status: number; // Adding status field that corresponds to the API response
  createdDate: string;
  lastLogin?: string | null;
  createdBy?: string | null;
  modifiedDate?: string | null;
  modifiedBy?: string | null;
}

export interface AdminUpdateUserDTO {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  birthday?: string; // Using string format for DateOnly
  gender?: string;
  newPassword?: string;
}

export interface RegisterUserDTO {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: Gender;
  birthDate: string; // This will be renamed in the actual request
}

export interface PagedList<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export interface UserFilterParams extends PaginationParams {
  keyword?: string;
  isDeleted?: boolean;
  role?: UserRole;
}
