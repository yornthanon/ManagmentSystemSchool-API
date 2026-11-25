import {apiClient} from './axios';
import type {PageResponse, Role, User} from '@/src/types';

export interface UserQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  role?: string;
}

export interface CreateUserPayload {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export const usersApi = {
  list: async (params: UserQueryParams = {}): Promise<PageResponse<User>> => {
    const {data} = await apiClient.get<PageResponse<User>>('/users', {params});
    return data;
  },
  create: async (payload: CreateUserPayload): Promise<User> => {
    const {data} = await apiClient.post<User>('/users', payload);
    return data;
  },
  update: async (id: number, payload: Partial<User>): Promise<User> => {
    const {data} = await apiClient.put<User>(`/users/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
  changePassword: async (id: number, newPassword: string): Promise<void> => {
    await apiClient.put(`/users/${id}/change-password`, null, {
      params: {newPassword},
    });
  },
  getMe: async (): Promise<User> => {
    const {data} = await apiClient.get<User>('/users/me');
    return data;
  },
  updateMe: async (payload: {fullName: string; email: string}): Promise<User> => {
    const {data} = await apiClient.put<User>('/users/me', payload);
    return data;
  },
  changeMyPassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.put('/users/me/change-password', payload);
  },
};
