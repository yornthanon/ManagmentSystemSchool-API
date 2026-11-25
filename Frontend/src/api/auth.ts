import {apiClient} from './axios';
import type {AuthResponse, User} from '@/src/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export const authApi = {
  getBootstrapStatus: async (): Promise<{needsAdminSetup: boolean}> => {
    try {
      const {data} = await apiClient.get<{needsAdminSetup: boolean}>('/auth/bootstrap-status');
      return data;
    } catch {
      return {needsAdminSetup: false};
    }
  },
  setupAdmin: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const {data} = await apiClient.post<AuthResponse>('/auth/setup-admin', payload);
    return data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const {data} = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const {data} = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  getSession: async (): Promise<AuthResponse | null> => {
    try {
      const {data} = await apiClient.get<AuthResponse>('/auth/session');
      return data;
    } catch {
      return null;
    }
  },
  me: async (): Promise<User> => {
    const {data} = await apiClient.get<User>('/users/me');
    return data;
  },
  validateToken: async (): Promise<{valid: boolean; user?: User}> => {
    const {data} = await apiClient.get<{valid: boolean; user?: User}>('/auth/validate-token');
    return data;
  },
};
