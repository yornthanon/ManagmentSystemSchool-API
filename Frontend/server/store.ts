import fs from 'fs';
import path from 'path';
import type {DatabaseState, PublicUser, UserRecord} from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'school-db.json');

function createInitialSeedData(): DatabaseState {
  const today = new Date().toISOString().slice(0, 10);
  const d = (offsetDays: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - offsetDays);
    return dt.toISOString().slice(0, 10);
  };

  return {
    nextId: 200,
    users: [],
    subjects: [
      {
        id: 1,
        code: 'MATH-301',
        name: 'Mathematics',
        department: 'STEM',
        credits: 4,
        description: 'Algebra II, Trigonometry, and Analytical Geometry',
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 2,
        code: 'PHYS-204',
        name: 'Physics',
        department: 'Science',
        credits: 4,
        description: 'Classical Mechanics, Waves, and Electromagnetism',
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 3,
        code: 'ENG-210',
        name: 'English Literature',
        department: 'Humanities',
        credits: 3,
        description: 'Critical Composition and Modern World Literature',
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 4,
        code: 'CS-320',
        name: 'Computer Science',
        department: 'STEM',
        credits: 4,
        description: 'Algorithms, Data Structures, and Web Engineering',
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 5,
        code: 'BIO-202',
        name: 'Biology',
        department: 'Science',
        credits: 4,
        description: 'Cellular Biology, Genetics, and Ecology',
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 6,
        code: 'HIST-105',
        name: 'World History',
        department: 'Humanities',
        credits: 3,
        description: 'Modern Global History and Civic Institutions',
        createdAt: '2026-08-15T08:00:00Z',
      },
    ],
    teachers: [
      {
        id: 1,
        teacherCode: 'T-101',
        username: 'claire.bennett',
        fullName: 'Claire Bennett',
        email: 'claire.bennett@scholara.edu',
        subject: 'Mathematics',
        department: 'STEM',
        phone: '+1 (555) 210-4401',
        hireDate: '2021-08-18',
        status: 'ACTIVE',
        avatarIndex: 1,
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 2,
        teacherCode: 'T-102',
        username: 'marcus.vance',
        fullName: 'Marcus Vance',
        email: 'marcus.vance@scholara.edu',
        subject: 'Physics',
        department: 'Science',
        phone: '+1 (555) 210-4402',
        hireDate: '2020-09-01',
        status: 'ACTIVE',
        avatarIndex: 2,
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 3,
        teacherCode: 'T-103',
        username: 'elena.rostova',
        fullName: 'Elena Rostova',
        email: 'elena.rostova@scholara.edu',
        subject: 'English Literature',
        department: 'Humanities',
        phone: '+1 (555) 210-4403',
        hireDate: '2022-01-10',
        status: 'ACTIVE',
        avatarIndex: 1,
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 4,
        teacherCode: 'T-104',
        username: 'david.kim',
        fullName: 'David Kim',
        email: 'david.kim@scholara.edu',
        subject: 'Computer Science',
        department: 'STEM',
        phone: '+1 (555) 210-4404',
        hireDate: '2023-08-14',
        status: 'ACTIVE',
        avatarIndex: 2,
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 5,
        teacherCode: 'T-105',
        username: 'nora.patel',
        fullName: 'Nora Patel',
        email: 'nora.patel@scholara.edu',
        subject: 'Biology',
        department: 'Science',
        phone: '+1 (555) 210-4405',
        hireDate: '2019-08-20',
        status: 'ACTIVE',
        avatarIndex: 1,
        createdAt: '2026-08-15T08:00:00Z',
      },
    ],
    classrooms: [
      {
        id: 1,
        name: 'Grade 10-A',
        grade: '10',
        academicYear: '2026-2027',
        roomNumber: 'Room 204',
        capacity: 30,
        homeroomTeacherId: 1,
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 2,
        name: 'Grade 10-B',
        grade: '10',
        academicYear: '2026-2027',
        roomNumber: 'Room 206',
        capacity: 30,
        homeroomTeacherId: 3,
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 3,
        name: 'Grade 11-A',
        grade: '11',
        academicYear: '2026-2027',
        roomNumber: 'Room 301',
        capacity: 28,
        homeroomTeacherId: 2,
        createdAt: '2026-08-15T08:00:00Z',
      },
      {
        id: 4,
        name: 'Grade 12-A',
        grade: '12',
        academicYear: '2026-2027',
        roomNumber: 'Room 402',
        capacity: 26,
        homeroomTeacherId: 4,
        createdAt: '2026-08-15T08:00:00Z',
      },
    ],
    students: [
      {
        id: 1,
        studentCode: 'S120',
        username: 'liam.carter',
        fullName: 'Liam Carter',
        email: 'liam.carter@student.scholara.edu',
        gradeLevel: '10',
        guardianName: 'Daniel Carter',
        guardianPhone: '+1 (555) 340-1020',
        dateOfBirth: '2010-04-12',
        status: 'ACTIVE',
        avatarIndex: 2,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 2,
        studentCode: 'S119',
        username: 'sophia.lee',
        fullName: 'Sophia Lee',
        email: 'sophia.lee@student.scholara.edu',
        gradeLevel: '10',
        guardianName: 'Grace Lee',
        guardianPhone: '+1 (555) 340-1021',
        dateOfBirth: '2010-07-19',
        status: 'ACTIVE',
        avatarIndex: 3,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 3,
        studentCode: 'S118',
        username: 'michael.tan',
        fullName: 'Michael Tan',
        email: 'michael.tan@student.scholara.edu',
        gradeLevel: '10',
        guardianName: 'Richard Tan',
        guardianPhone: '+1 (555) 340-1022',
        dateOfBirth: '2010-09-02',
        status: 'ACTIVE',
        avatarIndex: 2,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 4,
        studentCode: 'S117',
        username: 'alice.morgan',
        fullName: 'Alice Morgan',
        email: 'alice.morgan@student.scholara.edu',
        gradeLevel: '10',
        guardianName: 'Laura Morgan',
        guardianPhone: '+1 (555) 340-1023',
        dateOfBirth: '2010-11-28',
        status: 'ACTIVE',
        avatarIndex: 3,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 5,
        studentCode: 'S116',
        username: 'noah.brooks',
        fullName: 'Noah Brooks',
        email: 'noah.brooks@student.scholara.edu',
        gradeLevel: '11',
        guardianName: 'Karen Brooks',
        guardianPhone: '+1 (555) 340-1024',
        dateOfBirth: '2009-02-14',
        status: 'ACTIVE',
        avatarIndex: 2,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 6,
        studentCode: 'S115',
        username: 'emma.brown',
        fullName: 'Emma Brown',
        email: 'emma.brown@student.scholara.edu',
        gradeLevel: '11',
        guardianName: 'Thomas Brown',
        guardianPhone: '+1 (555) 340-1025',
        dateOfBirth: '2009-06-05',
        status: 'ACTIVE',
        avatarIndex: 3,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 7,
        studentCode: 'S114',
        username: 'david.bowen',
        fullName: 'David Bowen',
        email: 'david.bowen@student.scholara.edu',
        gradeLevel: '11',
        guardianName: 'Helen Bowen',
        guardianPhone: '+1 (555) 340-1026',
        dateOfBirth: '2009-08-21',
        status: 'ACTIVE',
        avatarIndex: 2,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 8,
        studentCode: 'S113',
        username: 'rachel.amanda',
        fullName: 'Rachel Amanda',
        email: 'rachel.amanda@student.scholara.edu',
        gradeLevel: '12',
        guardianName: 'Steven Amanda',
        guardianPhone: '+1 (555) 340-1027',
        dateOfBirth: '2008-03-11',
        status: 'ACTIVE',
        avatarIndex: 3,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 9,
        studentCode: 'S112',
        username: 'chris.johnson',
        fullName: 'Chris Johnson',
        email: 'chris.johnson@student.scholara.edu',
        gradeLevel: '12',
        guardianName: 'Patricia Johnson',
        guardianPhone: '+1 (555) 340-1028',
        dateOfBirth: '2008-12-03',
        status: 'ACTIVE',
        avatarIndex: 2,
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 10,
        studentCode: 'S111',
        username: 'olivia.clark',
        fullName: 'Olivia Clark',
        email: 'olivia.clark@student.scholara.edu',
        gradeLevel: '10',
        guardianName: 'Arthur Clark',
        guardianPhone: '+1 (555) 340-1029',
        dateOfBirth: '2010-05-16',
        status: 'ACTIVE',
        avatarIndex: 3,
        createdAt: '2026-08-20T08:00:00Z',
      },
    ],
    parents: [
      {
        id: 1,
        username: 'daniel.carter',
        fullName: 'Daniel Carter',
        email: 'daniel.carter@family.scholara.edu',
        phone: '+1 (555) 340-1020',
        studentIds: [1],
        relationship: 'Father',
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 2,
        username: 'grace.lee',
        fullName: 'Grace Lee',
        email: 'grace.lee@family.scholara.edu',
        phone: '+1 (555) 340-1021',
        studentIds: [2],
        relationship: 'Mother',
        createdAt: '2026-08-20T08:00:00Z',
      },
      {
        id: 3,
        username: 'laura.morgan',
        fullName: 'Laura Morgan',
        email: 'laura.morgan@family.scholara.edu',
        phone: '+1 (555) 340-1023',
        studentIds: [4],
        relationship: 'Mother',
        createdAt: '2026-08-20T08:00:00Z',
      },
    ],
    studentClasses: [
      {id: 1, studentId: 1, classroomId: 1, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 2, studentId: 2, classroomId: 1, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 3, studentId: 3, classroomId: 1, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 4, studentId: 4, classroomId: 2, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 5, studentId: 10, classroomId: 2, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 6, studentId: 5, classroomId: 3, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 7, studentId: 6, classroomId: 3, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 8, studentId: 7, classroomId: 3, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 9, studentId: 8, classroomId: 4, enrolledDate: '2026-09-01', status: 'ENROLLED'},
      {id: 10, studentId: 9, classroomId: 4, enrolledDate: '2026-09-01', status: 'ENROLLED'},
    ],
    classroomSubjects: [
      {id: 1, classroomId: 1, subjectId: 1, teacherId: 1, schedule: 'Mon/Wed/Fri 08:30 AM'},
      {id: 2, classroomId: 1, subjectId: 3, teacherId: 3, schedule: 'Tue/Thu 10:00 AM'},
      {id: 3, classroomId: 1, subjectId: 4, teacherId: 4, schedule: 'Mon/Wed 01:15 PM'},
      {id: 4, classroomId: 2, subjectId: 1, teacherId: 1, schedule: 'Tue/Thu 08:30 AM'},
      {id: 5, classroomId: 2, subjectId: 5, teacherId: 5, schedule: 'Mon/Fri 11:00 AM'},
      {id: 6, classroomId: 3, subjectId: 2, teacherId: 2, schedule: 'Mon/Wed/Fri 09:30 AM'},
      {id: 7, classroomId: 3, subjectId: 1, teacherId: 1, schedule: 'Tue/Thu 01:00 PM'},
      {id: 8, classroomId: 4, subjectId: 4, teacherId: 4, schedule: 'Mon/Wed/Fri 10:30 AM'},
      {id: 9, classroomId: 4, subjectId: 2, teacherId: 2, schedule: 'Tue/Thu 02:00 PM'},
    ],
    grades: [
      {
        id: 1,
        studentId: 1,
        classroomId: 1,
        subjectId: 1,
        teacherId: 1,
        term: 'Fall 2026',
        assessmentName: 'Midterm Exam',
        score: 92,
        maxScore: 100,
        letterGrade: 'A',
        remarks: 'Strong analytical reasoning',
        gradedDate: d(5),
      },
      {
        id: 2,
        studentId: 1,
        classroomId: 1,
        subjectId: 4,
        teacherId: 4,
        term: 'Fall 2026',
        assessmentName: 'Algorithms Lab 2',
        score: 96,
        maxScore: 100,
        letterGrade: 'A+',
        remarks: 'Clean code structure and edge-case handling',
        gradedDate: d(3),
      },
      {
        id: 3,
        studentId: 2,
        classroomId: 1,
        subjectId: 1,
        teacherId: 1,
        term: 'Fall 2026',
        assessmentName: 'Midterm Exam',
        score: 88,
        maxScore: 100,
        letterGrade: 'B+',
        remarks: 'Consistent problem solving',
        gradedDate: d(5),
      },
      {
        id: 4,
        studentId: 3,
        classroomId: 1,
        subjectId: 3,
        teacherId: 3,
        term: 'Fall 2026',
        assessmentName: 'Literary Essay',
        score: 84,
        maxScore: 100,
        letterGrade: 'B',
        remarks: 'Insightful thesis, expand textual citations',
        gradedDate: d(4),
      },
      {
        id: 5,
        studentId: 4,
        classroomId: 2,
        subjectId: 5,
        teacherId: 5,
        term: 'Fall 2026',
        assessmentName: 'Genetics Practical',
        score: 94,
        maxScore: 100,
        letterGrade: 'A',
        remarks: 'Thorough lab documentation',
        gradedDate: d(2),
      },
      {
        id: 6,
        studentId: 5,
        classroomId: 3,
        subjectId: 2,
        teacherId: 2,
        term: 'Fall 2026',
        assessmentName: 'Kinematics Quiz',
        score: 79,
        maxScore: 100,
        letterGrade: 'C+',
        remarks: 'Review vector decomposition',
        gradedDate: d(6),
      },
      {
        id: 7,
        studentId: 6,
        classroomId: 3,
        subjectId: 2,
        teacherId: 2,
        term: 'Fall 2026',
        assessmentName: 'Kinematics Quiz',
        score: 91,
        maxScore: 100,
        letterGrade: 'A-',
        remarks: 'Well-structured free body diagrams',
        gradedDate: d(6),
      },
      {
        id: 8,
        studentId: 8,
        classroomId: 4,
        subjectId: 4,
        teacherId: 4,
        term: 'Fall 2026',
        assessmentName: 'Systems Capstone',
        score: 95,
        maxScore: 100,
        letterGrade: 'A',
        remarks: 'Exemplary architecture and test coverage',
        gradedDate: d(1),
      },
    ],
    attendance: [
      {
        id: 1,
        studentId: 1,
        classroomId: 1,
        date: today,
        checkInTime: '08:15 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 2,
        studentId: 2,
        classroomId: 1,
        date: today,
        checkInTime: '08:42 AM',
        checkOutTime: '03:15 PM',
        status: 'LATE',
        notes: 'Arrived 12 minutes after morning bell',
      },
      {
        id: 3,
        studentId: 3,
        classroomId: 1,
        date: today,
        checkInTime: '08:20 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 4,
        studentId: 4,
        classroomId: 2,
        date: today,
        checkInTime: '08:18 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 5,
        studentId: 5,
        classroomId: 3,
        date: today,
        checkInTime: '-',
        checkOutTime: '-',
        status: 'ABSENT',
        notes: 'Parent notified — fever',
      },
      {
        id: 6,
        studentId: 6,
        classroomId: 3,
        date: today,
        checkInTime: '08:12 AM',
        checkOutTime: '03:20 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 7,
        studentId: 7,
        classroomId: 3,
        date: today,
        checkInTime: '-',
        checkOutTime: '-',
        status: 'ABSENT',
        notes: 'Unexcused absence',
      },
      {
        id: 8,
        studentId: 8,
        classroomId: 4,
        date: today,
        checkInTime: '08:22 AM',
        checkOutTime: '03:25 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 9,
        studentId: 9,
        classroomId: 4,
        date: today,
        checkInTime: '08:36 AM',
        checkOutTime: '03:25 PM',
        status: 'LATE',
        notes: 'Transit delay',
      },
      {
        id: 10,
        studentId: 10,
        classroomId: 2,
        date: today,
        checkInTime: '08:10 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 11,
        studentId: 1,
        classroomId: 1,
        date: d(1),
        checkInTime: '08:14 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 12,
        studentId: 2,
        classroomId: 1,
        date: d(1),
        checkInTime: '08:19 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 13,
        studentId: 3,
        classroomId: 1,
        date: d(1),
        checkInTime: '08:25 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 14,
        studentId: 1,
        classroomId: 1,
        date: d(2),
        checkInTime: '08:16 AM',
        checkOutTime: '03:15 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
      {
        id: 15,
        studentId: 5,
        classroomId: 3,
        date: d(2),
        checkInTime: '08:24 AM',
        checkOutTime: '03:20 PM',
        status: 'PRESENT',
        notes: 'On time',
      },
    ],
    announcements: [
      {
        id: 1,
        title: 'Fall Term Midterm Progress Reports Published',
        content:
          'All Grade 10–12 midterm assessments have been finalized by faculty. Students and parents can review subject scores and teacher remarks directly in the Grades module.',
        category: 'ACADEMIC',
        audience: 'ALL',
        authorId: 1,
        authorName: 'Academic Office',
        publishedDate: today,
        pinned: true,
      },
      {
        id: 2,
        title: 'Parent–Teacher Conference Schedule Open',
        content:
          'Individual 20-minute conference slots for homeroom classes are available next Thursday and Friday from 1:00 PM to 5:30 PM.',
        category: 'EVENT',
        audience: 'ALL',
        authorId: 1,
        authorName: 'Claire Bennett',
        publishedDate: d(2),
        pinned: false,
      },
      {
        id: 3,
        title: 'STEM Lab Safety & Equipment Check',
        content:
          'Physics and Biology laboratory sessions in Building B will follow updated lab bench checklists starting Monday morning.',
        category: 'GENERAL',
        audience: 'STUDENTS',
        authorId: 2,
        authorName: 'Marcus Vance',
        publishedDate: d(4),
        pinned: false,
      },
    ],
  };
}

class SchoolStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseState;
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.students)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial seed data if file is missing or unreadable
    }
    const seed = createInitialSeedData();
    this.save(seed);
    return seed;
  }

  private save(nextState?: DatabaseState) {
    const target = nextState || this.state;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {recursive: true});
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(target, null, 2), 'utf-8');
    } catch {
      // Ignore write errors in read-only environments
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public nextId(): number {
    this.state.nextId += 1;
    return this.state.nextId;
  }

  public commit(): void {
    this.save();
  }
}

export const store = new SchoolStore();

export function sanitizeUser(user: UserRecord): PublicUser {
  const {passwordHash: _removed, ...rest} = user;
  return rest;
}

export function computeLetterGrade(score: number, maxScore = 100): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 60) return 'D';
  return 'F';
}
