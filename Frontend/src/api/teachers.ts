import {apiClient} from './axios';
import type {PageResponse, Teacher} from '@/src/types';

export interface TeacherQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  subject?: string;
}

export const teachersApi = {
  list: async (params: TeacherQueryParams = {}): Promise<PageResponse<Teacher>> => {
    const {data} = await apiClient.get<PageResponse<Teacher>>('/teachers', {params});
    return data;
  },
  count: async (): Promise<{count: number}> => {
    const {data} = await apiClient.get<{count: number}>('/teachers/count');
    return data;
  },
  create: async (payload: Partial<Teacher>): Promise<Teacher> => {
    const {data} = await apiClient.post<Teacher>('/teachers', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Teacher>): Promise<Teacher> => {
    const {data} = await apiClient.put<Teacher>(`/teachers/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },
};
