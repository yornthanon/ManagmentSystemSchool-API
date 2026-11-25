import {apiClient} from './axios';
import type {PageResponse, Subject} from '@/src/types';

export const subjectsApi = {
  list: async (params: {page?: number; size?: number; sort?: string; search?: string} = {}) => {
    const {data} = await apiClient.get<PageResponse<Subject>>('/subjects', {params});
    return data;
  },
  count: async (): Promise<{count: number}> => {
    const {data} = await apiClient.get<{count: number}>('/subjects/count');
    return data;
  },
  create: async (payload: Partial<Subject>): Promise<Subject> => {
    const {data} = await apiClient.post<Subject>('/subjects', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Subject>): Promise<Subject> => {
    const {data} = await apiClient.put<Subject>(`/subjects/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`);
  },
};
