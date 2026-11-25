import {apiClient} from './axios';
import type {Attendance, PageResponse} from '@/src/types';

export interface AttendanceQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  classroomId?: number | string;
  date?: string;
  status?: string;
  search?: string;
}

export const attendanceApi = {
  list: async (params: AttendanceQueryParams = {}): Promise<PageResponse<Attendance>> => {
    const {data} = await apiClient.get<PageResponse<Attendance>>('/attendance', {params});
    return data;
  },
  getMe: async (): Promise<Attendance[]> => {
    const {data} = await apiClient.get<Attendance[]>('/attendance/me');
    return data;
  },
  getPercentage: async (params: {studentId?: number; classroomId?: number} = {}) => {
    const {data} = await apiClient.get<{total: number; attended: number; percentage: number}>(
      '/attendance/percentage',
      {params},
    );
    return data;
  },
  create: async (payload: Partial<Attendance>): Promise<Attendance> => {
    const {data} = await apiClient.post<Attendance>('/attendance', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Attendance>): Promise<Attendance> => {
    const {data} = await apiClient.put<Attendance>(`/attendance/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/attendance/${id}`);
  },
};
