import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from 'sonner';
import {AdminLayout} from '@/src/components/layout/AdminLayout';
import {TeacherLayout} from '@/src/components/layout/TeacherLayout';
import {StudentLayout} from '@/src/components/layout/StudentLayout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RoleHomeRedirect,
} from '@/src/components/layout/RouteGuards';
import {AuthProvider} from '@/src/hooks/useAuth';
import {ForbiddenPage} from '@/src/pages/ForbiddenPage';
import {LoginPage} from '@/src/pages/LoginPage';
import {NotFoundPage} from '@/src/pages/NotFoundPage';
import {ClassroomsPage} from '@/src/pages/admin/ClassroomsPage';
import {DashboardPage} from '@/src/pages/admin/DashboardPage';
import {EnrollmentPage} from '@/src/pages/admin/EnrollmentPage';
import {StudentsPage} from '@/src/pages/admin/StudentsPage';
import {SubjectsPage} from '@/src/pages/admin/SubjectsPage';
import {TeachersPage} from '@/src/pages/admin/TeachersPage';
import {AttendancePage} from '@/src/pages/teacher/AttendancePage';
import {GradesPage} from '@/src/pages/teacher/GradesPage';
import {MyClassesPage} from '@/src/pages/teacher/MyClassesPage';
import {MyAttendancePage} from '@/src/pages/student/MyAttendancePage';
import {MyGradesPage} from '@/src/pages/student/MyGradesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/" element={<RoleHomeRedirect />} />

            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* ADMIN */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <DashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <SubjectsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <TeachersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <StudentsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classrooms"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <ClassroomsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enrollments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <EnrollmentPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* TEACHER */}
            <Route
              path="/teacher/my-classes"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherLayout>
                    <MyClassesPage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherLayout>
                    <AttendancePage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/grades"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherLayout>
                    <GradesPage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            {/* STUDENT */}
            <Route
              path="/student/my-attendance"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentLayout>
                    <MyAttendancePage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-grades"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentLayout>
                    <MyGradesPage />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
