import {apiClient} from './axios';
import type {Classroom, ClassroomSubject, PageResponse} from '@/src/types';

export const classroomsApi = {
  list: async (
    params: {
      page?: number;
      size?: number;
      sort?: string;
      search?: string;
      grade?: string;
      year?: string;
    } = {},
  ) => {
    const {data} = await apiClient.get<PageResponse<Classroom>>('/classrooms', {params});
    return data;
  },
  count: async (): Promise<{count: number}> => {
    const {data} = await apiClient.get<{count: number}>('/classrooms/count');
    return data;
  },
  create: async (payload: Partial<Classroom>): Promise<Classroom> => {
    const {data} = await apiClient.post<Classroom>('/classrooms', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Classroom>): Promise<Classroom> => {
    const {data} = await apiClient.put<Classroom>(`/classrooms/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/classrooms/${id}`);
  },
  listSubjects: async (params: {page?: number; size?: number} = {}) => {
    const {data} = await apiClient.get<PageResponse<ClassroomSubject>>('/classroom-subjects', {
      params,
    });
    return data;
  },
  subjectsByClassroom: async (classroomId: number): Promise<ClassroomSubject[]> => {
    const {data} = await apiClient.get<ClassroomSubject[]>(
      `/classroom-subjects/classroom/${classroomId}`,
    );
    return data;
  },
  assignSubject: async (payload: {
    classroomId: number;
    subjectId: number;
    teacherId?: number;
    schedule: string;
  }): Promise<ClassroomSubject> => {
    const {data} = await apiClient.post<ClassroomSubject>('/classroom-subjects', payload);
    return data;
  },
  assignTeacher: async (classroomSubjectId: number, teacherId: number) => {
    const {data} = await apiClient.put<ClassroomSubject>(
      `/classroom-subjects/${classroomSubjectId}/teacher/${teacherId}`,
    );
    return data;
  },
  removeSubjectAssignment: async (id: number): Promise<void> => {
    await apiClient.delete(`/classroom-subjects/${id}`);
  },
};
