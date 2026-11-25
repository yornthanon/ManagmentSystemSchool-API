import {apiClient} from './axios';
import type {Announcement, PageResponse} from '@/src/types';

export const announcementsApi = {
  list: async (params: {page?: number; size?: number; sort?: string; keyword?: string} = {}) => {
    const {data} = await apiClient.get<PageResponse<Announcement>>('/announcements', {params});
    return data;
  },
  recent: async (): Promise<Announcement[]> => {
    const {data} = await apiClient.get<Announcement[]>('/announcements/recent');
    return data;
  },
  count: async (): Promise<{count: number}> => {
    const {data} = await apiClient.get<{count: number}>('/announcements/count');
    return data;
  },
  create: async (payload: Partial<Announcement>): Promise<Announcement> => {
    const {data} = await apiClient.post<Announcement>('/announcements', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Announcement>): Promise<Announcement> => {
    const {data} = await apiClient.put<Announcement>(`/announcements/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/announcements/${id}`);
  },
};
