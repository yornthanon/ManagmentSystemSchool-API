import {apiClient} from './axios';
import type {Grade, PageResponse} from '@/src/types';

export interface GradeQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  classroomId?: number | string;
  subjectId?: number | string;
  studentId?: number | string;
  search?: string;
}

export const gradesApi = {
  list: async (params: GradeQueryParams = {}): Promise<PageResponse<Grade>> => {
    const {data} = await apiClient.get<PageResponse<Grade>>('/grades', {params});
    return data;
  },
  getMe: async (): Promise<Grade[]> => {
    const {data} = await apiClient.get<Grade[]>('/grades/me');
    return data;
  },
  getStatus: async (): Promise<{total: number; averagePercentage: number; passingCount: number}> => {
    const {data} = await apiClient.get<{
      total: number;
      averagePercentage: number;
      passingCount: number;
    }>('/grades/status');
    return data;
  },
  create: async (payload: Partial<Grade>): Promise<Grade> => {
    const {data} = await apiClient.post<Grade>('/grades', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Grade>): Promise<Grade> => {
    const {data} = await apiClient.put<Grade>(`/grades/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/grades/${id}`);
  },
};
