import {apiClient} from './axios';
import type {PageResponse, Student, StudentClassEnrollment} from '@/src/types';

export interface StudentQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  classroomId?: number | string;
  status?: string;
}

export const studentsApi = {
  list: async (params: StudentQueryParams = {}): Promise<PageResponse<Student>> => {
    const {data} = await apiClient.get<PageResponse<Student>>('/students', {params});
    return data;
  },
  getById: async (id: number): Promise<Student> => {
    const {data} = await apiClient.get<Student>(`/students/${id}`);
    return data;
  },
  getMe: async (): Promise<Student> => {
    const {data} = await apiClient.get<Student>('/students/me');
    return data;
  },
  count: async (): Promise<{count: number}> => {
    const {data} = await apiClient.get<{count: number}>('/students/count');
    return data;
  },
  create: async (payload: Partial<Student>): Promise<Student> => {
    const {data} = await apiClient.post<Student>('/students', payload);
    return data;
  },
  update: async (id: number, payload: Partial<Student>): Promise<Student> => {
    const {data} = await apiClient.put<Student>(`/students/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
  listEnrollments: async (params: {page?: number; size?: number; sort?: string} = {}) => {
    const {data} = await apiClient.get<PageResponse<StudentClassEnrollment>>('/student-classes', {
      params,
    });
    return data;
  },
  enrollmentsByStudent: async (studentId: number): Promise<StudentClassEnrollment[]> => {
    const {data} = await apiClient.get<StudentClassEnrollment[]>(
      `/student-classes/student/${studentId}`,
    );
    return data;
  },
  enrollmentsByClassroom: async (classroomId: number): Promise<StudentClassEnrollment[]> => {
    const {data} = await apiClient.get<StudentClassEnrollment[]>(
      `/student-classes/classroom/${classroomId}`,
    );
    return data;
  },
  enrollStudent: async (payload: {
    studentId: number;
    classroomId: number;
    enrolledDate?: string;
  }): Promise<StudentClassEnrollment> => {
    const {data} = await apiClient.post<StudentClassEnrollment>('/student-classes', payload);
    return data;
  },
  removeEnrollment: async (id: number): Promise<void> => {
    await apiClient.delete(`/student-classes/${id}`);
  },
};
