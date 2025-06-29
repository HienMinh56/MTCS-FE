export interface ApiError {
  code: string;
  description: string;
}

export interface ApiResponseData {
  succeeded: boolean;
  errors?: ApiError[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  messageVN: string | null;
  errors: string | null;
}
