export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiErrorShape {
  success?: boolean;
  status?: number;
  message: string;
  data?: Record<string, string>;
  details?: Record<string, string>;
}
