import {apiClient} from './axios';
import type {ApiResponse, LoginResponse, User} from '@/src/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const {data} = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', payload);
    return data.data;
  },

  me: async (): Promise<User> => {
    const {data} = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return data.data;
  },
};
