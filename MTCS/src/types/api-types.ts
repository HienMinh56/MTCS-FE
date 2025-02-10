export interface ApiError {
  code: string;
  description: string;
}

export interface ApiResponseData {
  succeeded: boolean;
  errors?: ApiError[];
}

export interface ApiResponse<T = ApiResponseData> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[] | null;
}
