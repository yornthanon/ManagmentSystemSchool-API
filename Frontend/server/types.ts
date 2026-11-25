export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface UserRecord {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  passwordHash: string;
  active: boolean;
  createdAt: string;
}

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export interface StudentRecord {
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
  avatarIndex: number;
  createdAt: string;
}

export interface TeacherRecord {
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
  avatarIndex: number;
  createdAt: string;
}

export interface ParentRecord {
  id: number;
  userId?: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  studentIds: number[];
  relationship: string;
  createdAt: string;
}

export interface SubjectRecord {
  id: number;
  code: string;
  name: string;
  department: string;
  credits: number;
  description: string;
  createdAt: string;
}

export interface ClassroomRecord {
  id: number;
  name: string;
  grade: string;
  academicYear: string;
  roomNumber: string;
  capacity: number;
  homeroomTeacherId?: number;
  createdAt: string;
}

export interface StudentClassRecord {
  id: number;
  studentId: number;
  classroomId: number;
  enrolledDate: string;
  status: 'ENROLLED' | 'COMPLETED' | 'WITHDRAWN';
}

export interface ClassroomSubjectRecord {
  id: number;
  classroomId: number;
  subjectId: number;
  teacherId?: number;
  schedule: string;
}

export interface GradeRecord {
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
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  classroomId: number;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: AttendanceStatus;
  notes: string;
  recordedById?: number;
}

export interface AnnouncementRecord {
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

export interface DatabaseState {
  nextId: number;
  users: UserRecord[];
  students: StudentRecord[];
  teachers: TeacherRecord[];
  parents: ParentRecord[];
  subjects: SubjectRecord[];
  classrooms: ClassroomRecord[];
  studentClasses: StudentClassRecord[];
  classroomSubjects: ClassroomSubjectRecord[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  announcements: AnnouncementRecord[];
}
