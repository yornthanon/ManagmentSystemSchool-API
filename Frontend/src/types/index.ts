export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  active?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiErrorShape {
  status?: number;
  error?: string;
  message: string;
  details?: Record<string, string>;
  path?: string;
  timestamp?: string;
}

export interface Student {
  id: number;
  userId?: number;
  studentCode: string;
  username: string;
  fullName: string;
  email: string;
  gradeLevel: string;
  guardianName: string;
  guardianPhone: string;
  dateOfBirth: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarIndex?: number;
  classroomId?: number | null;
  classroomName?: string;
  createdAt?: string;
}

export interface Teacher {
  id: number;
  userId?: number;
  teacherCode: string;
  username: string;
  fullName: string;
  email: string;
  subject: string;
  department: string;
  phone: string;
  hireDate: string;
  status: 'ACTIVE' | 'ON_LEAVE';
  avatarIndex?: number;
  createdAt?: string;
}

export interface Parent {
  id: number;
  userId?: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  studentIds: number[];
  studentNames?: string[];
  students?: Student[];
  relationship: string;
  createdAt?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  department: string;
  credits: number;
  description: string;
  createdAt?: string;
}

export interface Classroom {
  id: number;
  name: string;
  grade: string;
  academicYear: string;
  roomNumber: string;
  capacity: number;
  homeroomTeacherId?: number;
  homeroomTeacherName?: string;
  studentCount?: number;
  createdAt?: string;
}

export interface StudentClassEnrollment {
  id: number;
  studentId: number;
  classroomId: number;
  enrolledDate: string;
  status: 'ENROLLED' | 'COMPLETED' | 'WITHDRAWN';
  studentName?: string;
  studentCode?: string;
  classroomName?: string;
  grade?: string;
  academicYear?: string;
}

export interface ClassroomSubject {
  id: number;
  classroomId: number;
  subjectId: number;
  teacherId?: number;
  schedule: string;
  classroomName?: string;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
}

export interface Grade {
  id: number;
  studentId: number;
  classroomId: number;
  subjectId: number;
  teacherId?: number;
  term: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  letterGrade: string;
  remarks: string;
  gradedDate: string;
  studentName?: string;
  studentCode?: string;
  classroomName?: string;
  subjectName?: string;
  subjectCode?: string;
}

export interface Attendance {
  id: number;
  studentId: number;
  classroomId: number;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: AttendanceStatus;
  notes: string;
  studentName?: string;
  studentCode?: string;
  avatarIndex?: number;
  classroomName?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: 'ACADEMIC' | 'EVENT' | 'URGENT' | 'GENERAL';
  audience: 'ALL' | 'TEACHERS' | 'STUDENTS';
  authorId: number;
  authorName: string;
  publishedDate: string;
  pinned: boolean;
}
