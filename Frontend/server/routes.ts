import {Router} from 'express';
import {
  type AuthenticatedRequest,
  clearSessionCookie,
  extractTokenAndUser,
  hashPassword,
  requireAuth,
  requireRole,
  setSessionCookie,
  signJwt,
  verifyPassword,
} from './auth.ts';
import {paginateAndSort, sendNotFound, sendValidationError} from './pagination.ts';
import {computeLetterGrade, sanitizeUser, store} from './store.ts';
import type {AttendanceStatus, Role} from './types.ts';

const VALID_ROLES: Role[] = ['ADMIN', 'TEACHER', 'STUDENT'];
const VALID_ATTENDANCE: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];

function findStudentForUser(user: {id: number; username: string; email: string}) {
  const db = store.getState();
  return db.students.find(
    (s) =>
      s.userId === user.id ||
      s.username.toLowerCase() === user.username.toLowerCase() ||
      s.email.toLowerCase() === user.email.toLowerCase(),
  );
}

function findTeacherForUser(user: {id: number; username: string; email: string}) {
  const db = store.getState();
  return db.teachers.find(
    (t) =>
      t.userId === user.id ||
      t.username.toLowerCase() === user.username.toLowerCase() ||
      t.email.toLowerCase() === user.email.toLowerCase(),
  );
}

function findParentForUser(user: {id: number; username: string; email: string}) {
  const db = store.getState();
  return db.parents.find(
    (p) =>
      p.userId === user.id ||
      p.username.toLowerCase() === user.username.toLowerCase() ||
      p.email.toLowerCase() === user.email.toLowerCase(),
  );
}

export function createApiRouter(): Router {
  const router = Router();

  // ========================
  // AUTHENTICATION
  // ========================
  router.get('/auth/bootstrap-status', (_req, res) => {
    const db = store.getState();
    const hasAdmin = db.users.some((u) => u.role === 'ADMIN' && u.active);
    res.json({needsAdminSetup: !hasAdmin});
  });

  router.post('/auth/setup-admin', (req, res) => {
    const db = store.getState();
    const hasAdmin = db.users.some((u) => u.role === 'ADMIN' && u.active);
    if (hasAdmin) {
      res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'Initial administrator setup has already been completed.',
        path: req.path,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const {username, email, password, fullName} = req.body ?? {};
    const details: Record<string, string> = {};
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      details.fullName = 'Full name is required';
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      details.email = 'Valid email address is required';
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      details.password = 'Password must be at least 6 characters';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername =
      typeof username === 'string' && username.trim()
        ? username.trim().toLowerCase()
        : cleanEmail.split('@')[0];

    const newUser = {
      id: store.nextId(),
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail,
      role: 'ADMIN' as Role,
      passwordHash: hashPassword(password),
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    store.commit();

    const token = signJwt(newUser);
    setSessionCookie(res, token);
    res.status(201).json({token, user: sanitizeUser(newUser)});
  });

  router.post('/auth/login', (req, res) => {
    const {email, password} = req.body ?? {};
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(401).json({message: 'Invalid email or username'});
      return;
    }

    const identifier = email.trim().toLowerCase();
    const db = store.getState();
    const user = db.users.find(
      (u) =>
        u.active &&
        (u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier),
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({message: 'Invalid email or username'});
      return;
    }

    const token = signJwt(user);
    setSessionCookie(res, token);
    res.json({token, user: sanitizeUser(user)});
  });

  router.post('/auth/register', (req, res) => {
    const {username, email, password, fullName} = req.body ?? {};
    const details: Record<string, string> = {};
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      details.username = 'Username must be at least 3 characters';
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      details.email = 'Must be a valid email address';
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      details.password = 'Password must be at least 6 characters';
    }
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      details.fullName = 'Full name must not be blank';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const db = store.getState();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      sendValidationError(res, req.path, {email: 'Email is already registered'});
      return;
    }
    if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      sendValidationError(res, req.path, {username: 'Username is already taken'});
      return;
    }

    const newUser = {
      id: store.nextId(),
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail,
      role: 'STUDENT' as Role,
      passwordHash: hashPassword(password),
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    const existingStudent = db.students.find(
      (s) => s.email.toLowerCase() === cleanEmail || s.username.toLowerCase() === cleanUsername,
    );
    if (existingStudent) {
      existingStudent.userId = newUser.id;
    } else {
      const studentId = store.nextId();
      db.students.push({
        id: studentId,
        userId: newUser.id,
        studentCode: `S${120 + studentId}`,
        username: cleanUsername,
        fullName: fullName.trim(),
        email: cleanEmail,
        gradeLevel: '10',
        guardianName: '',
        guardianPhone: '',
        dateOfBirth: '2010-01-01',
        status: 'ACTIVE',
        avatarIndex: studentId % 2 === 0 ? 3 : 2,
        createdAt: new Date().toISOString(),
      });
    }

    store.commit();
    const token = signJwt(newUser);
    setSessionCookie(res, token);
    res.status(201).json({token, user: sanitizeUser(newUser)});
  });

  router.post('/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({message: 'Logged out successfully'});
  });

  router.get('/auth/validate-token', (req, res) => {
    const {user} = extractTokenAndUser(req);
    if (!user) {
      res.status(401).json({valid: false});
      return;
    }
    res.json({valid: true, user});
  });

  router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(req.currentUser);
  });

  router.get('/auth/session', (req, res) => {
    const {token, user} = extractTokenAndUser(req);
    if (!user || !token) {
      res.status(401).json({authenticated: false});
      return;
    }
    res.json({token, user});
  });

  // ========================
  // USERS
  // ========================
  router.get('/users/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(req.currentUser);
  });

  router.put('/users/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = store.getState();
    const user = db.users.find((u) => u.id === req.currentUser!.id);
    if (!user) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    const {fullName, email} = req.body ?? {};
    const details: Record<string, string> = {};
    if (fullName !== undefined && (!fullName || typeof fullName !== 'string' || !fullName.trim())) {
      details.fullName = 'Full name must not be blank';
    }
    if (email !== undefined && (!email || typeof email !== 'string' || !email.includes('@'))) {
      details.email = 'Valid email is required';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    if (fullName) user.fullName = fullName.trim();
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (db.users.some((u) => u.id !== user.id && u.email.toLowerCase() === cleanEmail)) {
        sendValidationError(res, req.path, {email: 'Email is already in use'});
        return;
      }
      user.email = cleanEmail;
    }
    store.commit();
    res.json(sanitizeUser(user));
  });

  router.put('/users/me/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = store.getState();
    const user = db.users.find((u) => u.id === req.currentUser!.id);
    if (!user) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    const {currentPassword, newPassword} = req.body ?? {};
    const details: Record<string, string> = {};
    if (!currentPassword || !verifyPassword(String(currentPassword), user.passwordHash)) {
      details.currentPassword = 'Current password is incorrect';
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      details.newPassword = 'New password must be at least 6 characters';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }
    user.passwordHash = hashPassword(newPassword);
    store.commit();
    res.json({message: 'Password updated successfully'});
  });

  router.delete('/users/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = store.getState();
    const idx = db.users.findIndex((u) => u.id === req.currentUser!.id);
    if (idx !== -1) {
      db.users.splice(idx, 1);
      store.commit();
    }
    clearSessionCookie(res);
    res.json({message: 'Account deleted'});
  });

  router.get('/users', requireAuth, requireRole('ADMIN'), (req, res) => {
    const db = store.getState();
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const roleFilter = typeof req.query.role === 'string' ? req.query.role.trim().toUpperCase() : '';

    const filtered = db.users
      .filter((u) => {
        if (roleFilter && u.role !== roleFilter) return false;
        if (search) {
          return (
            u.fullName.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.username.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .map(sanitizeUser);

    res.json(paginateAndSort(filtered as unknown as Record<string, unknown>[], req));
  });

  router.post('/users', requireAuth, requireRole('ADMIN'), (req, res) => {
    const {username, fullName, email, password, role} = req.body ?? {};
    const details: Record<string, string> = {};
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      details.username = 'Username must be at least 3 characters';
    }
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      details.fullName = 'Full name is required';
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      details.email = 'Valid email is required';
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      details.password = 'Password must be at least 6 characters';
    }
    if (!role || !VALID_ROLES.includes(role)) {
      details.role = 'Role must be ADMIN, TEACHER, or STUDENT';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const db = store.getState();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      sendValidationError(res, req.path, {email: 'Email already exists'});
      return;
    }
    if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      sendValidationError(res, req.path, {username: 'Username already exists'});
      return;
    }

    const newUser = {
      id: store.nextId(),
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail,
      role: role as Role,
      passwordHash: hashPassword(password),
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    // Link or create role profile record
    if (role === 'STUDENT') {
      const existing = db.students.find((s) => s.email.toLowerCase() === cleanEmail);
      if (existing) existing.userId = newUser.id;
      else {
        const sid = store.nextId();
        db.students.push({
          id: sid,
          userId: newUser.id,
          studentCode: `S${120 + sid}`,
          username: cleanUsername,
          fullName: fullName.trim(),
          email: cleanEmail,
          gradeLevel: '10',
          guardianName: '',
          guardianPhone: '',
          dateOfBirth: '2010-01-01',
          status: 'ACTIVE',
          avatarIndex: sid % 2 === 0 ? 3 : 2,
          createdAt: new Date().toISOString(),
        });
      }
    } else if (role === 'TEACHER') {
      const existing = db.teachers.find((t) => t.email.toLowerCase() === cleanEmail);
      if (existing) existing.userId = newUser.id;
      else {
        const tid = store.nextId();
        db.teachers.push({
          id: tid,
          userId: newUser.id,
          teacherCode: `T-${100 + tid}`,
          username: cleanUsername,
          fullName: fullName.trim(),
          email: cleanEmail,
          subject: 'General Studies',
          department: 'Academic',
          phone: '',
          hireDate: new Date().toISOString().slice(0, 10),
          status: 'ACTIVE',
          avatarIndex: 1,
          createdAt: new Date().toISOString(),
        });
      }
    }

    store.commit();
    res.status(201).json(sanitizeUser(newUser));
  });

  router.get('/users/username/:username', requireAuth, requireRole('ADMIN'), (req, res) => {
    const user = store
      .getState()
      .users.find((u) => u.username.toLowerCase() === req.params.username.toLowerCase());
    if (!user) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    res.json(sanitizeUser(user));
  });

  router.get('/users/email/:email', requireAuth, requireRole('ADMIN'), (req, res) => {
    const user = store
      .getState()
      .users.find((u) => u.email.toLowerCase() === req.params.email.toLowerCase());
    if (!user) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    res.json(sanitizeUser(user));
  });

  router.get('/users/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (req.currentUser!.role !== 'ADMIN' && req.currentUser!.id !== id) {
      res.status(403).json({status: 403, error: 'Forbidden', message: 'Access denied'});
      return;
    }
    const user = store.getState().users.find((u) => u.id === id);
    if (!user) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    res.json(sanitizeUser(user));
  });

  router.put('/users/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const user = db.users.find((u) => u.id === id);
    if (!user) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    const {fullName, email, role, active} = req.body ?? {};
    if (fullName !== undefined) user.fullName = String(fullName).trim();
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (role !== undefined && VALID_ROLES.includes(role)) user.role = role;
    if (typeof active === 'boolean') user.active = active;
    store.commit();
    res.json(sanitizeUser(user));
  });

  router.put('/users/:id/change-password', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const newPassword =
      typeof req.query.newPassword === 'string'
        ? req.query.newPassword
        : req.body?.newPassword;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      sendValidationError(res, req.path, {newPassword: 'Password must be at least 6 characters'});
      return;
    }
    const user = store.getState().users.find((u) => u.id === id);
    if (!user) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    user.passwordHash = hashPassword(newPassword);
    store.commit();
    res.json({message: 'Password updated'});
  });

  router.delete('/users/:id', requireAuth, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (id === req.currentUser!.id) {
      sendValidationError(res, req.path, {id: 'Cannot delete currently signed-in administrator'});
      return;
    }
    const db = store.getState();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'User not found');
      return;
    }
    db.users.splice(idx, 1);
    store.commit();
    res.json({message: 'User deleted'});
  });

  // ========================
  // STUDENTS
  // ========================
  router.get('/students/count', requireAuth, (_req, res) => {
    res.json({count: store.getState().students.length});
  });

  router.get('/students/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const student = findStudentForUser(req.currentUser!);
    if (!student) {
      sendNotFound(res, req.path, 'Student profile not found');
      return;
    }
    res.json(student);
  });

  router.get('/students/username/:username', requireAuth, (req, res) => {
    const student = store
      .getState()
      .students.find((s) => s.username.toLowerCase() === req.params.username.toLowerCase());
    if (!student) {
      sendNotFound(res, req.path, 'Student not found');
      return;
    }
    res.json(student);
  });

  router.get('/students', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = store.getState();
    const role = req.currentUser!.role;
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const classroomId = req.query.classroomId ? Number(req.query.classroomId) : null;
    const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim().toUpperCase() : '';

    let list = db.students;
    if (role === 'STUDENT') {
      const own = findStudentForUser(req.currentUser!);
      list = own ? [own] : [];
    }

    if (classroomId) {
      const enrolledIds = new Set(
        db.studentClasses
          .filter((sc) => sc.classroomId === classroomId && sc.status === 'ENROLLED')
          .map((sc) => sc.studentId),
      );
      list = list.filter((s) => enrolledIds.has(s.id));
    }

    if (statusFilter) {
      list = list.filter((s) => s.status === statusFilter);
    }

    if (search) {
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          s.studentCode.toLowerCase().includes(search) ||
          s.username.toLowerCase().includes(search),
      );
    }

    const enriched = list.map((s) => {
      const enrollment = db.studentClasses.find((sc) => sc.studentId === s.id && sc.status === 'ENROLLED');
      const classroom = enrollment
        ? db.classrooms.find((c) => c.id === enrollment.classroomId)
        : undefined;
      return {
        ...s,
        classroomId: classroom?.id ?? null,
        classroomName: classroom?.name ?? 'Unassigned',
      };
    });

    res.json(paginateAndSort(enriched as unknown as Record<string, unknown>[], req));
  });

  router.post('/students', requireAuth, requireRole('ADMIN'), (req, res) => {
    const {
      username,
      fullName,
      email,
      gradeLevel,
      guardianName,
      guardianPhone,
      dateOfBirth,
      status,
    } = req.body ?? {};
    const details: Record<string, string> = {};
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      details.fullName = 'Full name is required';
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      details.email = 'Valid email is required';
    }
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      details.username = 'Username must be at least 3 characters';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const db = store.getState();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    if (db.students.some((s) => s.email.toLowerCase() === cleanEmail)) {
      sendValidationError(res, req.path, {email: 'Student email already exists'});
      return;
    }

    const id = store.nextId();
    const student = {
      id,
      studentCode: `S${120 + id}`,
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail,
      gradeLevel: String(gradeLevel || '10'),
      guardianName: String(guardianName || ''),
      guardianPhone: String(guardianPhone || ''),
      dateOfBirth: String(dateOfBirth || '2010-01-01'),
      status: status === 'INACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const),
      avatarIndex: id % 2 === 0 ? 3 : 2,
      createdAt: new Date().toISOString(),
    };
    db.students.push(student);
    store.commit();
    res.status(201).json(student);
  });

  router.get('/students/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const student = store.getState().students.find((s) => s.id === id);
    if (!student) {
      sendNotFound(res, req.path, 'Student not found');
      return;
    }
    res.json(student);
  });

  router.put('/students/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const student = store.getState().students.find((s) => s.id === id);
    if (!student) {
      sendNotFound(res, req.path, 'Student not found');
      return;
    }
    const {fullName, email, gradeLevel, guardianName, guardianPhone, dateOfBirth, status} =
      req.body ?? {};
    if (fullName) student.fullName = String(fullName).trim();
    if (email) student.email = String(email).trim().toLowerCase();
    if (gradeLevel) student.gradeLevel = String(gradeLevel);
    if (guardianName !== undefined) student.guardianName = String(guardianName);
    if (guardianPhone !== undefined) student.guardianPhone = String(guardianPhone);
    if (dateOfBirth) student.dateOfBirth = String(dateOfBirth);
    if (status === 'ACTIVE' || status === 'INACTIVE') student.status = status;
    store.commit();
    res.json(student);
  });

  router.put('/students/:id/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const student = store.getState().students.find((s) => s.id === id);
    if (!student) {
      sendNotFound(res, req.path, 'Student not found');
      return;
    }
    if (req.currentUser!.role !== 'ADMIN') {
      const own = findStudentForUser(req.currentUser!);
      if (!own || own.id !== id) {
        res.status(403).json({status: 403, error: 'Forbidden', message: 'Access denied'});
        return;
      }
    }
    const fullName =
      typeof req.query.fullName === 'string' ? req.query.fullName : req.body?.fullName;
    const email = typeof req.query.email === 'string' ? req.query.email : req.body?.email;
    if (fullName) student.fullName = String(fullName).trim();
    if (email) student.email = String(email).trim().toLowerCase();
    store.commit();
    res.json(student);
  });

  router.delete('/students/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Student not found');
      return;
    }
    db.students.splice(idx, 1);
    db.studentClasses = db.studentClasses.filter((sc) => sc.studentId !== id);
    db.grades = db.grades.filter((g) => g.studentId !== id);
    db.attendance = db.attendance.filter((a) => a.studentId !== id);
    store.commit();
    res.json({message: 'Student deleted'});
  });

  // ========================
  // STUDENT ENROLLMENT / CLASSES
  // ========================
  function enrichEnrollment(sc: {
    id: number;
    studentId: number;
    classroomId: number;
    enrolledDate: string;
    status: string;
  }) {
    const db = store.getState();
    const student = db.students.find((s) => s.id === sc.studentId);
    const classroom = db.classrooms.find((c) => c.id === sc.classroomId);
    return {
      ...sc,
      studentName: student?.fullName ?? 'Unknown Student',
      studentCode: student?.studentCode ?? '',
      classroomName: classroom?.name ?? 'Unknown Classroom',
      grade: classroom?.grade ?? '',
      academicYear: classroom?.academicYear ?? '',
    };
  }

  router.get('/student-classes/count', requireAuth, (_req, res) => {
    res.json({count: store.getState().studentClasses.length});
  });

  router.get('/student-classes/check', requireAuth, (req, res) => {
    const studentId = Number(req.query.studentId);
    const classroomId = Number(req.query.classroomId);
    const exists = store
      .getState()
      .studentClasses.some(
        (sc) => sc.studentId === studentId && sc.classroomId === classroomId && sc.status === 'ENROLLED',
      );
    res.json({enrolled: exists});
  });

  router.get('/student-classes/student/:studentId', requireAuth, (req, res) => {
    const studentId = Number(req.params.studentId);
    const rows = store
      .getState()
      .studentClasses.filter((sc) => sc.studentId === studentId)
      .map(enrichEnrollment);
    res.json(rows);
  });

  router.get('/student-classes/classroom/:classroomId', requireAuth, (req, res) => {
    const classroomId = Number(req.params.classroomId);
    const rows = store
      .getState()
      .studentClasses.filter((sc) => sc.classroomId === classroomId)
      .map(enrichEnrollment);
    res.json(rows);
  });

  router.get('/student-classes', requireAuth, (req, res) => {
    const rows = store.getState().studentClasses.map(enrichEnrollment);
    res.json(paginateAndSort(rows as unknown as Record<string, unknown>[], req));
  });

  router.get('/student-classes/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const sc = store.getState().studentClasses.find((item) => item.id === id);
    if (!sc) {
      sendNotFound(res, req.path, 'Enrollment not found');
      return;
    }
    res.json(enrichEnrollment(sc));
  });

  router.post('/student-classes', requireAuth, requireRole('ADMIN'), (req, res) => {
    const {studentId, classroomId, enrolledDate} = req.body ?? {};
    const sid = Number(studentId);
    const cid = Number(classroomId);
    const db = store.getState();

    const details: Record<string, string> = {};
    if (!db.students.some((s) => s.id === sid)) details.studentId = 'Valid student is required';
    if (!db.classrooms.some((c) => c.id === cid)) details.classroomId = 'Valid classroom is required';
    if (
      db.studentClasses.some(
        (sc) => sc.studentId === sid && sc.classroomId === cid && sc.status === 'ENROLLED',
      )
    ) {
      details.classroomId = 'Student is already enrolled in this classroom';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const record = {
      id: store.nextId(),
      studentId: sid,
      classroomId: cid,
      enrolledDate: String(enrolledDate || new Date().toISOString().slice(0, 10)),
      status: 'ENROLLED' as const,
    };
    db.studentClasses.push(record);
    store.commit();
    res.status(201).json(enrichEnrollment(record));
  });

  router.delete('/student-classes/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.studentClasses.findIndex((sc) => sc.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Enrollment not found');
      return;
    }
    db.studentClasses.splice(idx, 1);
    store.commit();
    res.json({message: 'Enrollment removed'});
  });

  // ========================
  // TEACHERS
  // ========================
  router.get('/teachers/count', requireAuth, (_req, res) => {
    res.json({count: store.getState().teachers.length});
  });

  router.get('/teachers/username/:username', requireAuth, (req, res) => {
    const teacher = store
      .getState()
      .teachers.find((t) => t.username.toLowerCase() === req.params.username.toLowerCase());
    if (!teacher) {
      sendNotFound(res, req.path, 'Teacher not found');
      return;
    }
    res.json(teacher);
  });

  router.get('/teachers/subject/:subject', requireAuth, (req, res) => {
    const subj = req.params.subject.toLowerCase();
    const rows = store.getState().teachers.filter((t) => t.subject.toLowerCase().includes(subj));
    res.json(rows);
  });

  router.get('/teachers', requireAuth, (req, res) => {
    const db = store.getState();
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const subjectFilter =
      typeof req.query.subject === 'string' ? req.query.subject.trim().toLowerCase() : '';

    let list = db.teachers;
    if (subjectFilter) {
      list = list.filter((t) => t.subject.toLowerCase().includes(subjectFilter));
    }
    if (search) {
      list = list.filter(
        (t) =>
          t.fullName.toLowerCase().includes(search) ||
          t.email.toLowerCase().includes(search) ||
          t.subject.toLowerCase().includes(search) ||
          t.teacherCode.toLowerCase().includes(search),
      );
    }

    res.json(paginateAndSort(list as unknown as Record<string, unknown>[], req));
  });

  router.post('/teachers', requireAuth, requireRole('ADMIN'), (req, res) => {
    const {username, fullName, email, subject, department, phone, hireDate, status} =
      req.body ?? {};
    const details: Record<string, string> = {};
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      details.username = 'Username must be at least 3 characters';
    }
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      details.fullName = 'Full name is required';
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      details.email = 'Valid email is required';
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      details.subject = 'Primary subject is required';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const db = store.getState();
    const id = store.nextId();
    const teacher = {
      id,
      teacherCode: `T-${100 + id}`,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      department: String(department || 'Academic'),
      phone: String(phone || ''),
      hireDate: String(hireDate || new Date().toISOString().slice(0, 10)),
      status: status === 'ON_LEAVE' ? ('ON_LEAVE' as const) : ('ACTIVE' as const),
      avatarIndex: 1,
      createdAt: new Date().toISOString(),
    };
    db.teachers.push(teacher);
    store.commit();
    res.status(201).json(teacher);
  });

  router.get('/teachers/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const teacher = store.getState().teachers.find((t) => t.id === id);
    if (!teacher) {
      sendNotFound(res, req.path, 'Teacher not found');
      return;
    }
    res.json(teacher);
  });

  router.put('/teachers/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const teacher = store.getState().teachers.find((t) => t.id === id);
    if (!teacher) {
      sendNotFound(res, req.path, 'Teacher not found');
      return;
    }
    const {fullName, email, subject, department, phone, hireDate, status} = req.body ?? {};
    if (fullName) teacher.fullName = String(fullName).trim();
    if (email) teacher.email = String(email).trim().toLowerCase();
    if (subject) teacher.subject = String(subject).trim();
    if (department) teacher.department = String(department).trim();
    if (phone !== undefined) teacher.phone = String(phone);
    if (hireDate) teacher.hireDate = String(hireDate);
    if (status === 'ACTIVE' || status === 'ON_LEAVE') teacher.status = status;
    store.commit();
    res.json(teacher);
  });

  router.put('/teachers/:id/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const teacher = store.getState().teachers.find((t) => t.id === id);
    if (!teacher) {
      sendNotFound(res, req.path, 'Teacher not found');
      return;
    }
    if (req.currentUser!.role !== 'ADMIN') {
      const own = findTeacherForUser(req.currentUser!);
      if (!own || own.id !== id) {
        res.status(403).json({status: 403, error: 'Forbidden', message: 'Access denied'});
        return;
      }
    }
    const fullName =
      typeof req.query.fullName === 'string' ? req.query.fullName : req.body?.fullName;
    const email = typeof req.query.email === 'string' ? req.query.email : req.body?.email;
    const subject = typeof req.query.subject === 'string' ? req.query.subject : req.body?.subject;
    if (fullName) teacher.fullName = String(fullName).trim();
    if (email) teacher.email = String(email).trim().toLowerCase();
    if (subject) teacher.subject = String(subject).trim();
    store.commit();
    res.json(teacher);
  });

  router.delete('/teachers/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.teachers.findIndex((t) => t.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Teacher not found');
      return;
    }
    db.teachers.splice(idx, 1);
    store.commit();
    res.json({message: 'Teacher deleted'});
  });

  // ========================
  // SUBJECTS
  // ========================
  router.get('/subjects/count', requireAuth, (_req, res) => {
    res.json({count: store.getState().subjects.length});
  });

  router.get('/subjects/search', requireAuth, (req, res) => {
    const name = typeof req.query.name === 'string' ? req.query.name.trim().toLowerCase() : '';
    const rows = store
      .getState()
      .subjects.filter((s) => s.name.toLowerCase().includes(name) || s.code.toLowerCase().includes(name));
    res.json(rows);
  });

  router.get('/subjects/name/:name', requireAuth, (req, res) => {
    const subj = store
      .getState()
      .subjects.find((s) => s.name.toLowerCase() === req.params.name.toLowerCase());
    if (!subj) {
      sendNotFound(res, req.path, 'Subject not found');
      return;
    }
    res.json(subj);
  });

  router.get('/subjects', requireAuth, (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    let list = store.getState().subjects;
    if (search) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.code.toLowerCase().includes(search) ||
          s.department.toLowerCase().includes(search),
      );
    }
    res.json(paginateAndSort(list as unknown as Record<string, unknown>[], req));
  });

  router.post('/subjects', requireAuth, requireRole('ADMIN'), (req, res) => {
    const {code, name, department, credits, description} = req.body ?? {};
    const details: Record<string, string> = {};
    if (!code || typeof code !== 'string' || !code.trim()) details.code = 'Subject code is required';
    if (!name || typeof name !== 'string' || !name.trim()) details.name = 'Subject name is required';
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }
    const db = store.getState();
    const subject = {
      id: store.nextId(),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      department: String(department || 'General'),
      credits: Number(credits) > 0 ? Number(credits) : 3,
      description: String(description || ''),
      createdAt: new Date().toISOString(),
    };
    db.subjects.push(subject);
    store.commit();
    res.status(201).json(subject);
  });

  router.get('/subjects/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const subj = store.getState().subjects.find((s) => s.id === id);
    if (!subj) {
      sendNotFound(res, req.path, 'Subject not found');
      return;
    }
    res.json(subj);
  });

  router.put('/subjects/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const subj = store.getState().subjects.find((s) => s.id === id);
    if (!subj) {
      sendNotFound(res, req.path, 'Subject not found');
      return;
    }
    const {code, name, department, credits, description} = req.body ?? {};
    if (code) subj.code = String(code).trim().toUpperCase();
    if (name) subj.name = String(name).trim();
    if (department) subj.department = String(department).trim();
    if (credits !== undefined) subj.credits = Number(credits) || subj.credits;
    if (description !== undefined) subj.description = String(description);
    store.commit();
    res.json(subj);
  });

  router.delete('/subjects/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.subjects.findIndex((s) => s.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Subject not found');
      return;
    }
    db.subjects.splice(idx, 1);
    db.classroomSubjects = db.classroomSubjects.filter((cs) => cs.subjectId !== id);
    store.commit();
    res.json({message: 'Subject deleted'});
  });

  // ========================
  // CLASSROOMS
  // ========================
  function enrichClassroom(c: {
    id: number;
    name: string;
    grade: string;
    academicYear: string;
    roomNumber: string;
    capacity: number;
    homeroomTeacherId?: number;
    createdAt: string;
  }) {
    const db = store.getState();
    const studentCount = db.studentClasses.filter(
      (sc) => sc.classroomId === c.id && sc.status === 'ENROLLED',
    ).length;
    const teacher = c.homeroomTeacherId
      ? db.teachers.find((t) => t.id === c.homeroomTeacherId)
      : undefined;
    return {
      ...c,
      studentCount,
      homeroomTeacherName: teacher?.fullName ?? 'Unassigned',
    };
  }

  router.get('/classrooms/count', requireAuth, (_req, res) => {
    res.json({count: store.getState().classrooms.length});
  });

  router.get('/classrooms/grade/:grade/year/:year', requireAuth, (req, res) => {
    const rows = store
      .getState()
      .classrooms.filter((c) => c.grade === req.params.grade && c.academicYear === req.params.year)
      .map(enrichClassroom);
    res.json(rows);
  });

  router.get('/classrooms/grade/:grade', requireAuth, (req, res) => {
    const rows = store
      .getState()
      .classrooms.filter((c) => c.grade === req.params.grade)
      .map(enrichClassroom);
    res.json(rows);
  });

  router.get('/classrooms/year/:year', requireAuth, (req, res) => {
    const rows = store
      .getState()
      .classrooms.filter((c) => c.academicYear === req.params.year)
      .map(enrichClassroom);
    res.json(rows);
  });

  router.get('/classrooms', requireAuth, (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const grade = typeof req.query.grade === 'string' ? req.query.grade.trim() : '';
    const year = typeof req.query.year === 'string' ? req.query.year.trim() : '';

    let list = store.getState().classrooms;
    if (grade) list = list.filter((c) => c.grade === grade);
    if (year) list = list.filter((c) => c.academicYear === year);
    if (search) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.roomNumber.toLowerCase().includes(search) ||
          c.grade.toLowerCase().includes(search),
      );
    }
    const enriched = list.map(enrichClassroom);
    res.json(paginateAndSort(enriched as unknown as Record<string, unknown>[], req));
  });

  router.post('/classrooms', requireAuth, requireRole('ADMIN'), (req, res) => {
    const {name, grade, academicYear, roomNumber, capacity, homeroomTeacherId} = req.body ?? {};
    const details: Record<string, string> = {};
    if (!name || typeof name !== 'string' || !name.trim()) details.name = 'Classroom name is required';
    if (!grade || typeof grade !== 'string' || !grade.trim()) details.grade = 'Grade is required';
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }
    const db = store.getState();
    const classroom = {
      id: store.nextId(),
      name: name.trim(),
      grade: grade.trim(),
      academicYear: String(academicYear || '2026-2027'),
      roomNumber: String(roomNumber || 'Room 101'),
      capacity: Number(capacity) > 0 ? Number(capacity) : 30,
      homeroomTeacherId: homeroomTeacherId ? Number(homeroomTeacherId) : undefined,
      createdAt: new Date().toISOString(),
    };
    db.classrooms.push(classroom);
    store.commit();
    res.status(201).json(enrichClassroom(classroom));
  });

  router.get('/classrooms/:id/student-count', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const count = store
      .getState()
      .studentClasses.filter((sc) => sc.classroomId === id && sc.status === 'ENROLLED').length;
    res.json({count});
  });

  router.get('/classrooms/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const classroom = store.getState().classrooms.find((c) => c.id === id);
    if (!classroom) {
      sendNotFound(res, req.path, 'Classroom not found');
      return;
    }
    res.json(enrichClassroom(classroom));
  });

  router.put('/classrooms/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const classroom = store.getState().classrooms.find((c) => c.id === id);
    if (!classroom) {
      sendNotFound(res, req.path, 'Classroom not found');
      return;
    }
    const {name, grade, academicYear, roomNumber, capacity, homeroomTeacherId} = req.body ?? {};
    if (name) classroom.name = String(name).trim();
    if (grade) classroom.grade = String(grade).trim();
    if (academicYear) classroom.academicYear = String(academicYear).trim();
    if (roomNumber) classroom.roomNumber = String(roomNumber).trim();
    if (capacity !== undefined) classroom.capacity = Number(capacity) || classroom.capacity;
    if (homeroomTeacherId !== undefined) {
      classroom.homeroomTeacherId = homeroomTeacherId ? Number(homeroomTeacherId) : undefined;
    }
    store.commit();
    res.json(enrichClassroom(classroom));
  });

  router.delete('/classrooms/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.classrooms.findIndex((c) => c.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Classroom not found');
      return;
    }
    db.classrooms.splice(idx, 1);
    db.studentClasses = db.studentClasses.filter((sc) => sc.classroomId !== id);
    db.classroomSubjects = db.classroomSubjects.filter((cs) => cs.classroomId !== id);
    store.commit();
    res.json({message: 'Classroom deleted'});
  });

  // ========================
  // CLASSROOM SUBJECTS
  // ========================
  function enrichClassroomSubject(cs: {
    id: number;
    classroomId: number;
    subjectId: number;
    teacherId?: number;
    schedule: string;
  }) {
    const db = store.getState();
    const classroom = db.classrooms.find((c) => c.id === cs.classroomId);
    const subject = db.subjects.find((s) => s.id === cs.subjectId);
    const teacher = cs.teacherId ? db.teachers.find((t) => t.id === cs.teacherId) : undefined;
    return {
      ...cs,
      classroomName: classroom?.name ?? 'Unknown Classroom',
      subjectName: subject?.name ?? 'Unknown Subject',
      subjectCode: subject?.code ?? '',
      teacherName: teacher?.fullName ?? 'Unassigned',
    };
  }

  router.get('/classroom-subjects/count', requireAuth, (_req, res) => {
    res.json({count: store.getState().classroomSubjects.length});
  });

  router.get('/classroom-subjects/classroom/:classroomId', requireAuth, (req, res) => {
    const classroomId = Number(req.params.classroomId);
    const rows = store
      .getState()
      .classroomSubjects.filter((cs) => cs.classroomId === classroomId)
      .map(enrichClassroomSubject);
    res.json(rows);
  });

  router.get('/classroom-subjects/teacher/:teacherId', requireAuth, (req, res) => {
    const teacherId = Number(req.params.teacherId);
    const rows = store
      .getState()
      .classroomSubjects.filter((cs) => cs.teacherId === teacherId)
      .map(enrichClassroomSubject);
    res.json(rows);
  });

  router.get('/classroom-subjects/subject/:subjectId', requireAuth, (req, res) => {
    const subjectId = Number(req.params.subjectId);
    const rows = store
      .getState()
      .classroomSubjects.filter((cs) => cs.subjectId === subjectId)
      .map(enrichClassroomSubject);
    res.json(rows);
  });

  router.get('/classroom-subjects', requireAuth, (req, res) => {
    const rows = store.getState().classroomSubjects.map(enrichClassroomSubject);
    res.json(paginateAndSort(rows as unknown as Record<string, unknown>[], req));
  });

  router.get('/classroom-subjects/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const cs = store.getState().classroomSubjects.find((item) => item.id === id);
    if (!cs) {
      sendNotFound(res, req.path, 'Classroom subject assignment not found');
      return;
    }
    res.json(enrichClassroomSubject(cs));
  });

  router.post('/classroom-subjects', requireAuth, requireRole('ADMIN'), (req, res) => {
    const {classroomId, subjectId, teacherId, schedule} = req.body ?? {};
    const cid = Number(classroomId);
    const sid = Number(subjectId);
    const tid = teacherId ? Number(teacherId) : undefined;
    const db = store.getState();

    const details: Record<string, string> = {};
    if (!db.classrooms.some((c) => c.id === cid)) details.classroomId = 'Valid classroom is required';
    if (!db.subjects.some((s) => s.id === sid)) details.subjectId = 'Valid subject is required';
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const record = {
      id: store.nextId(),
      classroomId: cid,
      subjectId: sid,
      teacherId: tid,
      schedule: String(schedule || 'Mon/Wed/Fri 09:00 AM'),
    };
    db.classroomSubjects.push(record);
    store.commit();
    res.status(201).json(enrichClassroomSubject(record));
  });

  router.put(
    '/classroom-subjects/:classroomSubjectId/teacher/:teacherId',
    requireAuth,
    requireRole('ADMIN'),
    (req, res) => {
      const id = Number(req.params.classroomSubjectId);
      const teacherId = Number(req.params.teacherId);
      const db = store.getState();
      const cs = db.classroomSubjects.find((item) => item.id === id);
      if (!cs) {
        sendNotFound(res, req.path, 'Assignment not found');
        return;
      }
      if (!db.teachers.some((t) => t.id === teacherId)) {
        sendNotFound(res, req.path, 'Teacher not found');
        return;
      }
      cs.teacherId = teacherId;
      store.commit();
      res.json(enrichClassroomSubject(cs));
    },
  );

  router.delete(
    '/classroom-subjects/:classroomSubjectId/teacher',
    requireAuth,
    requireRole('ADMIN'),
    (req, res) => {
      const id = Number(req.params.classroomSubjectId);
      const cs = store.getState().classroomSubjects.find((item) => item.id === id);
      if (!cs) {
        sendNotFound(res, req.path, 'Assignment not found');
        return;
      }
      cs.teacherId = undefined;
      store.commit();
      res.json(enrichClassroomSubject(cs));
    },
  );

  router.delete('/classroom-subjects/:id', requireAuth, requireRole('ADMIN'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.classroomSubjects.findIndex((item) => item.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Assignment not found');
      return;
    }
    db.classroomSubjects.splice(idx, 1);
    store.commit();
    res.json({message: 'Classroom subject assignment removed'});
  });

  // ========================
  // GRADES
  // ========================
  function enrichGrade(g: {
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
  }) {
    const db = store.getState();
    const student = db.students.find((s) => s.id === g.studentId);
    const classroom = db.classrooms.find((c) => c.id === g.classroomId);
    const subject = db.subjects.find((s) => s.id === g.subjectId);
    return {
      ...g,
      studentName: student?.fullName ?? 'Unknown Student',
      studentCode: student?.studentCode ?? '',
      classroomName: classroom?.name ?? 'Unknown Classroom',
      subjectName: subject?.name ?? 'Unknown Subject',
      subjectCode: subject?.code ?? '',
    };
  }

  router.get('/grades/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const student = findStudentForUser(req.currentUser!);
    if (!student) {
      res.json([]);
      return;
    }
    const rows = store
      .getState()
      .grades.filter((g) => g.studentId === student.id)
      .map(enrichGrade);
    res.json(rows);
  });

  router.get('/grades/status', requireAuth, (_req, res) => {
    const grades = store.getState().grades;
    const total = grades.length;
    const avg =
      total > 0
        ? Math.round(
            (grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0) / total) * 10,
          ) / 10
        : 0;
    const passing = grades.filter((g) => (g.score / g.maxScore) * 100 >= 60).length;
    res.json({total, averagePercentage: avg, passingCount: passing});
  });

  router.get('/grades/student/:studentId/average', requireAuth, (req, res) => {
    const studentId = Number(req.params.studentId);
    const rows = store.getState().grades.filter((g) => g.studentId === studentId);
    const average =
      rows.length > 0
        ? Math.round(
            (rows.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0) / rows.length) * 10,
          ) / 10
        : 0;
    res.json({studentId, average, count: rows.length});
  });

  router.get('/grades/subject/:subjectId/average', requireAuth, (req, res) => {
    const subjectId = Number(req.params.subjectId);
    const rows = store.getState().grades.filter((g) => g.subjectId === subjectId);
    const average =
      rows.length > 0
        ? Math.round(
            (rows.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0) / rows.length) * 10,
          ) / 10
        : 0;
    res.json({subjectId, average, count: rows.length});
  });

  router.get('/grades/student/:studentId/subject/:subjectId', requireAuth, (req, res) => {
    const studentId = Number(req.params.studentId);
    const subjectId = Number(req.params.subjectId);
    const rows = store
      .getState()
      .grades.filter((g) => g.studentId === studentId && g.subjectId === subjectId)
      .map(enrichGrade);
    res.json(rows);
  });

  router.get('/grades/student/:studentId/classroom/:classroomId', requireAuth, (req, res) => {
    const studentId = Number(req.params.studentId);
    const classroomId = Number(req.params.classroomId);
    const rows = store
      .getState()
      .grades.filter((g) => g.studentId === studentId && g.classroomId === classroomId)
      .map(enrichGrade);
    res.json(rows);
  });

  router.get('/grades/student/:studentId', requireAuth, (req, res) => {
    const studentId = Number(req.params.studentId);
    const rows = store
      .getState()
      .grades.filter((g) => g.studentId === studentId)
      .map(enrichGrade);
    res.json(rows);
  });

  router.get('/grades/subject/:subjectId', requireAuth, (req, res) => {
    const subjectId = Number(req.params.subjectId);
    const rows = store
      .getState()
      .grades.filter((g) => g.subjectId === subjectId)
      .map(enrichGrade);
    res.json(rows);
  });

  router.get('/grades/classroom/:classroomId', requireAuth, (req, res) => {
    const classroomId = Number(req.params.classroomId);
    const rows = store
      .getState()
      .grades.filter((g) => g.classroomId === classroomId)
      .map(enrichGrade);
    res.json(rows);
  });

  router.get('/grades', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = store.getState();
    const role = req.currentUser!.role;
    let list = db.grades;

    if (role === 'STUDENT') {
      const own = findStudentForUser(req.currentUser!);
      list = own ? list.filter((g) => g.studentId === own.id) : [];
    }

    if (req.query.classroomId) {
      const cid = Number(req.query.classroomId);
      list = list.filter((g) => g.classroomId === cid);
    }
    if (req.query.subjectId) {
      const sid = Number(req.query.subjectId);
      list = list.filter((g) => g.subjectId === sid);
    }
    if (req.query.studentId) {
      const stid = Number(req.query.studentId);
      list = list.filter((g) => g.studentId === stid);
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    let enriched = list.map(enrichGrade);
    if (search) {
      enriched = enriched.filter(
        (g) =>
          g.studentName.toLowerCase().includes(search) ||
          g.subjectName.toLowerCase().includes(search) ||
          g.assessmentName.toLowerCase().includes(search),
      );
    }

    res.json(paginateAndSort(enriched as unknown as Record<string, unknown>[], req));
  });

  router.post('/grades', requireAuth, requireRole('ADMIN', 'TEACHER'), (req, res) => {
    const {
      studentId,
      classroomId,
      subjectId,
      term,
      assessmentName,
      score,
      maxScore,
      remarks,
      gradedDate,
    } = req.body ?? {};
    const db = store.getState();
    const sid = Number(studentId);
    const cid = Number(classroomId);
    const subId = Number(subjectId);
    const numScore = Number(score);
    const numMax = Number(maxScore) > 0 ? Number(maxScore) : 100;

    const details: Record<string, string> = {};
    if (!db.students.some((s) => s.id === sid)) details.studentId = 'Valid student is required';
    if (!db.classrooms.some((c) => c.id === cid)) details.classroomId = 'Valid classroom is required';
    if (!db.subjects.some((s) => s.id === subId)) details.subjectId = 'Valid subject is required';
    if (!assessmentName || typeof assessmentName !== 'string' || !assessmentName.trim()) {
      details.assessmentName = 'Assessment name is required';
    }
    if (!Number.isFinite(numScore) || numScore < 0 || numScore > numMax) {
      details.score = `Score must be between 0 and ${numMax}`;
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const grade = {
      id: store.nextId(),
      studentId: sid,
      classroomId: cid,
      subjectId: subId,
      term: String(term || 'Fall 2026'),
      assessmentName: assessmentName.trim(),
      score: numScore,
      maxScore: numMax,
      letterGrade: computeLetterGrade(numScore, numMax),
      remarks: String(remarks || ''),
      gradedDate: String(gradedDate || new Date().toISOString().slice(0, 10)),
    };
    db.grades.unshift(grade);
    store.commit();
    res.status(201).json(enrichGrade(grade));
  });

  router.get('/grades/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const grade = store.getState().grades.find((g) => g.id === id);
    if (!grade) {
      sendNotFound(res, req.path, 'Grade record not found');
      return;
    }
    res.json(enrichGrade(grade));
  });

  router.put('/grades/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), (req, res) => {
    const id = Number(req.params.id);
    const grade = store.getState().grades.find((g) => g.id === id);
    if (!grade) {
      sendNotFound(res, req.path, 'Grade record not found');
      return;
    }
    const {term, assessmentName, score, maxScore, remarks, gradedDate} = req.body ?? {};
    if (term) grade.term = String(term);
    if (assessmentName) grade.assessmentName = String(assessmentName).trim();
    if (maxScore !== undefined && Number(maxScore) > 0) grade.maxScore = Number(maxScore);
    if (score !== undefined) grade.score = Number(score);
    grade.letterGrade = computeLetterGrade(grade.score, grade.maxScore);
    if (remarks !== undefined) grade.remarks = String(remarks);
    if (gradedDate) grade.gradedDate = String(gradedDate);
    store.commit();
    res.json(enrichGrade(grade));
  });

  router.delete('/grades/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.grades.findIndex((g) => g.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Grade record not found');
      return;
    }
    db.grades.splice(idx, 1);
    store.commit();
    res.json({message: 'Grade deleted'});
  });

  // ========================
  // ATTENDANCE
  // ========================
  function enrichAttendance(a: {
    id: number;
    studentId: number;
    classroomId: number;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    status: AttendanceStatus;
    notes: string;
  }) {
    const db = store.getState();
    const student = db.students.find((s) => s.id === a.studentId);
    const classroom = db.classrooms.find((c) => c.id === a.classroomId);
    return {
      ...a,
      studentName: student?.fullName ?? 'Unknown Student',
      studentCode: student?.studentCode ?? '',
      avatarIndex: student?.avatarIndex ?? 2,
      classroomName: classroom?.name ?? 'Unknown Classroom',
    };
  }

  router.get('/attendance/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const student = findStudentForUser(req.currentUser!);
    if (!student) {
      res.json([]);
      return;
    }
    const rows = store
      .getState()
      .attendance.filter((a) => a.studentId === student.id)
      .map(enrichAttendance);
    res.json(rows);
  });

  router.get('/attendance/percentage', requireAuth, (req, res) => {
    const db = store.getState();
    let list = db.attendance;
    if (req.query.studentId) {
      list = list.filter((a) => a.studentId === Number(req.query.studentId));
    }
    if (req.query.classroomId) {
      list = list.filter((a) => a.classroomId === Number(req.query.classroomId));
    }
    const total = list.length;
    const attended = list.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const percentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 100;
    res.json({total, attended, percentage});
  });

  router.get('/attendance/range', requireAuth, (req, res) => {
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : '';
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : '';
    let list = store.getState().attendance;
    if (startDate) list = list.filter((a) => a.date >= startDate);
    if (endDate) list = list.filter((a) => a.date <= endDate);
    if (req.query.classroomId) list = list.filter((a) => a.classroomId === Number(req.query.classroomId));
    if (req.query.studentId) list = list.filter((a) => a.studentId === Number(req.query.studentId));
    res.json(list.map(enrichAttendance));
  });

  router.get('/attendance/student/:studentId/date/:date', requireAuth, (req, res) => {
    const studentId = Number(req.params.studentId);
    const rows = store
      .getState()
      .attendance.filter((a) => a.studentId === studentId && a.date === req.params.date)
      .map(enrichAttendance);
    res.json(rows);
  });

  router.get('/attendance/classroom/:classroomId/date/:date', requireAuth, (req, res) => {
    const classroomId = Number(req.params.classroomId);
    const rows = store
      .getState()
      .attendance.filter((a) => a.classroomId === classroomId && a.date === req.params.date)
      .map(enrichAttendance);
    res.json(rows);
  });

  router.get('/attendance/student/:studentId', requireAuth, (req, res) => {
    const studentId = Number(req.params.studentId);
    const rows = store
      .getState()
      .attendance.filter((a) => a.studentId === studentId)
      .map(enrichAttendance);
    res.json(rows);
  });

  router.get('/attendance/classroom/:classroomId', requireAuth, (req, res) => {
    const classroomId = Number(req.params.classroomId);
    const rows = store
      .getState()
      .attendance.filter((a) => a.classroomId === classroomId)
      .map(enrichAttendance);
    res.json(rows);
  });

  router.get('/attendance', requireAuth, (req: AuthenticatedRequest, res) => {
    const db = store.getState();
    const role = req.currentUser!.role;
    let list = db.attendance;

    if (role === 'STUDENT') {
      const own = findStudentForUser(req.currentUser!);
      list = own ? list.filter((a) => a.studentId === own.id) : [];
    }

    if (req.query.classroomId) {
      const cid = Number(req.query.classroomId);
      list = list.filter((a) => a.classroomId === cid);
    }
    if (req.query.date && typeof req.query.date === 'string') {
      list = list.filter((a) => a.date === req.query.date);
    }
    if (req.query.status && typeof req.query.status === 'string') {
      const st = req.query.status.toUpperCase();
      list = list.filter((a) => a.status === st);
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    let enriched = list.map(enrichAttendance);
    if (search) {
      enriched = enriched.filter(
        (a) =>
          a.studentName.toLowerCase().includes(search) ||
          a.studentCode.toLowerCase().includes(search) ||
          a.classroomName.toLowerCase().includes(search),
      );
    }

    res.json(paginateAndSort(enriched as unknown as Record<string, unknown>[], req));
  });

  router.post('/attendance', requireAuth, requireRole('ADMIN', 'TEACHER'), (req: AuthenticatedRequest, res) => {
    const {studentId, classroomId, date, checkInTime, checkOutTime, status, notes} = req.body ?? {};
    const db = store.getState();
    const sid = Number(studentId);
    const cid = Number(classroomId);
    const st = typeof status === 'string' ? (status.toUpperCase() as AttendanceStatus) : 'PRESENT';

    const details: Record<string, string> = {};
    if (!db.students.some((s) => s.id === sid)) details.studentId = 'Valid student is required';
    if (!db.classrooms.some((c) => c.id === cid)) details.classroomId = 'Valid classroom is required';
    if (!date || typeof date !== 'string') details.date = 'Date (YYYY-MM-DD) is required';
    if (!VALID_ATTENDANCE.includes(st)) details.status = 'Invalid attendance status';
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const record = {
      id: store.nextId(),
      studentId: sid,
      classroomId: cid,
      date: date.trim(),
      checkInTime: st === 'ABSENT' ? '-' : String(checkInTime || '08:15 AM'),
      checkOutTime: st === 'ABSENT' ? '-' : String(checkOutTime || '03:15 PM'),
      status: st,
      notes: String(notes || ''),
      recordedById: req.currentUser!.id,
    };
    db.attendance.unshift(record);
    store.commit();
    res.status(201).json(enrichAttendance(record));
  });

  router.get('/attendance/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const record = store.getState().attendance.find((a) => a.id === id);
    if (!record) {
      sendNotFound(res, req.path, 'Attendance record not found');
      return;
    }
    res.json(enrichAttendance(record));
  });

  router.put('/attendance/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), (req, res) => {
    const id = Number(req.params.id);
    const record = store.getState().attendance.find((a) => a.id === id);
    if (!record) {
      sendNotFound(res, req.path, 'Attendance record not found');
      return;
    }
    const {date, checkInTime, checkOutTime, status, notes} = req.body ?? {};
    if (date) record.date = String(date);
    if (status && VALID_ATTENDANCE.includes(String(status).toUpperCase() as AttendanceStatus)) {
      record.status = String(status).toUpperCase() as AttendanceStatus;
    }
    if (checkInTime !== undefined) record.checkInTime = String(checkInTime);
    if (checkOutTime !== undefined) record.checkOutTime = String(checkOutTime);
    if (notes !== undefined) record.notes = String(notes);
    store.commit();
    res.json(enrichAttendance(record));
  });

  router.delete('/attendance/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.attendance.findIndex((a) => a.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Attendance record not found');
      return;
    }
    db.attendance.splice(idx, 1);
    store.commit();
    res.json({message: 'Attendance record deleted'});
  });

  // ========================
  // ANNOUNCEMENTS
  // ========================
  router.get('/announcements/count', requireAuth, (_req, res) => {
    res.json({count: store.getState().announcements.length});
  });

  router.get('/announcements/recent', requireAuth, (_req, res) => {
    const list = [...store.getState().announcements]
      .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
      .slice(0, 5);
    res.json(list);
  });

  router.get('/announcements/search', requireAuth, (req, res) => {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
    const rows = store
      .getState()
      .announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) || a.content.toLowerCase().includes(keyword),
      );
    res.json(rows);
  });

  router.get('/announcements/author/:authorId', requireAuth, (req, res) => {
    const authorId = Number(req.params.authorId);
    res.json(store.getState().announcements.filter((a) => a.authorId === authorId));
  });

  router.get('/announcements/date-range', requireAuth, (req, res) => {
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : '';
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : '';
    let list = store.getState().announcements;
    if (startDate) list = list.filter((a) => a.publishedDate >= startDate);
    if (endDate) list = list.filter((a) => a.publishedDate <= endDate);
    res.json(list);
  });

  router.get('/announcements', requireAuth, (req, res) => {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
    let list = store.getState().announcements;
    if (keyword) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.content.toLowerCase().includes(keyword) ||
          a.category.toLowerCase().includes(keyword),
      );
    }
    res.json(paginateAndSort(list as unknown as Record<string, unknown>[], req));
  });

  const createAnnouncementHandler = (req: AuthenticatedRequest, res: import('express').Response) => {
    const {title, content, category, audience, pinned} = req.body ?? {};
    const details: Record<string, string> = {};
    if (!title || typeof title !== 'string' || !title.trim()) details.title = 'Title is required';
    if (!content || typeof content !== 'string' || !content.trim()) {
      details.content = 'Content is required';
    }
    if (Object.keys(details).length > 0) {
      sendValidationError(res, req.path, details);
      return;
    }

    const db = store.getState();
    const record = {
      id: store.nextId(),
      title: title.trim(),
      content: content.trim(),
      category: (category || 'GENERAL') as 'ACADEMIC' | 'EVENT' | 'URGENT' | 'GENERAL',
      audience: (audience || 'ALL') as 'ALL' | 'TEACHERS' | 'STUDENTS',
      authorId: req.currentUser!.id,
      authorName: req.currentUser!.fullName,
      publishedDate: new Date().toISOString().slice(0, 10),
      pinned: Boolean(pinned),
    };
    db.announcements.unshift(record);
    store.commit();
    res.status(201).json(record);
  };

  router.post('/announcements', requireAuth, requireRole('ADMIN', 'TEACHER'), createAnnouncementHandler);
  router.post(
    '/announcements/create',
    requireAuth,
    requireRole('ADMIN', 'TEACHER'),
    createAnnouncementHandler,
  );

  router.get('/announcements/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const ann = store.getState().announcements.find((a) => a.id === id);
    if (!ann) {
      sendNotFound(res, req.path, 'Announcement not found');
      return;
    }
    res.json(ann);
  });

  router.put('/announcements/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), (req, res) => {
    const id = Number(req.params.id);
    const ann = store.getState().announcements.find((a) => a.id === id);
    if (!ann) {
      sendNotFound(res, req.path, 'Announcement not found');
      return;
    }
    const {title, content, category, audience, pinned} = req.body ?? {};
    if (title) ann.title = String(title).trim();
    if (content) ann.content = String(content).trim();
    if (category) ann.category = category;
    if (audience) ann.audience = audience;
    if (typeof pinned === 'boolean') ann.pinned = pinned;
    store.commit();
    res.json(ann);
  });

  router.delete('/announcements/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), (req, res) => {
    const id = Number(req.params.id);
    const db = store.getState();
    const idx = db.announcements.findIndex((a) => a.id === id);
    if (idx === -1) {
      sendNotFound(res, req.path, 'Announcement not found');
      return;
    }
    db.announcements.splice(idx, 1);
    store.commit();
    res.json({message: 'Announcement deleted'});
  });

  return router;
}
