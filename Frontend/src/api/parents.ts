import {apiClient} from './axios';
import type {PageResponse, Parent} from '@/src/types';

export const parentsApi = {
  list: async (params: {page?: number; size?: number; sort?: string; search?: string} = {}) => {
    const {data} = await apiClient.get<PageResponse<Parent>>('/parents', {params});
    return data;
  },
  getMe: async (): Promise<Parent> => {
    const {data} = await apiClient.get<Parent>('/parents/me');
    return data;
  },
  create: async (payload: Partial<Parent>): Promise<Parent> => {
    const {data} = await apiClient.post<Parent>('/parents', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Parent>): Promise<Parent> => {
    const {data} = await apiClient.put<Parent>(`/parents/${id}`, payload);
    return data;
  },
  updateProfile: async (id: number, payload: Partial<Parent>): Promise<Parent> => {
    const {data} = await apiClient.put<Parent>(`/parents/${id}/profile`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/parents/${id}`);
  },
};
