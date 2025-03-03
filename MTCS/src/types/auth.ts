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
