import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from 'sonner';
import {AppLayout} from '@/src/components/layout/AppLayout';
import {ProtectedRoute, PublicOnlyRoute} from '@/src/components/RouteGuards';
import {AuthProvider} from '@/src/hooks/useAuth';
import {AnnouncementsPage} from '@/src/pages/AnnouncementsPage';
import {AttendancePage} from '@/src/pages/AttendancePage';
import {ClassroomsPage} from '@/src/pages/ClassroomsPage';
import {DashboardPage} from '@/src/pages/DashboardPage';
import {EnrollmentPage} from '@/src/pages/EnrollmentPage';
import {ForbiddenPage} from '@/src/pages/ForbiddenPage';
import {GradesPage} from '@/src/pages/GradesPage';
import {LoginPage} from '@/src/pages/LoginPage';
import {NotFoundPage} from '@/src/pages/NotFoundPage';
import {ProfilePage} from '@/src/pages/ProfilePage';
import {RegisterPage} from '@/src/pages/RegisterPage';
import {StudentsPage} from '@/src/pages/StudentsPage';
import {SubjectsPage} from '@/src/pages/SubjectsPage';
import {TeachersPage} from '@/src/pages/TeachersPage';
import {UsersPage} from '@/src/pages/UsersPage';
import type {Role} from '@/src/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  },
});

function GuardedLayout({
  allowedRoles,
  children,
}: {
  allowedRoles?: Role[];
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* Shared authenticated routes */}
            <Route
              path="/dashboard"
              element={
                <GuardedLayout>
                  <DashboardPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <GuardedLayout>
                  <ProfilePage />
                </GuardedLayout>
              }
            />
            <Route
              path="/announcements"
              element={
                <GuardedLayout>
                  <AnnouncementsPage />
                </GuardedLayout>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/users"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <UsersPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/admin/students"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <StudentsPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <TeachersPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <SubjectsPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/admin/classrooms"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <ClassroomsPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/admin/enrollment"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <EnrollmentPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/admin/grades"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <GradesPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <GuardedLayout allowedRoles={['ADMIN']}>
                  <AttendancePage />
                </GuardedLayout>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher/classes"
              element={
                <GuardedLayout allowedRoles={['TEACHER']}>
                  <ClassroomsPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <GuardedLayout allowedRoles={['TEACHER']}>
                  <StudentsPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/teacher/grades"
              element={
                <GuardedLayout allowedRoles={['TEACHER']}>
                  <GradesPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <GuardedLayout allowedRoles={['TEACHER']}>
                  <AttendancePage />
                </GuardedLayout>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/classes"
              element={
                <GuardedLayout allowedRoles={['STUDENT']}>
                  <ClassroomsPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/student/grades"
              element={
                <GuardedLayout allowedRoles={['STUDENT']}>
                  <GradesPage />
                </GuardedLayout>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <GuardedLayout allowedRoles={['STUDENT']}>
                  <AttendancePage />
                </GuardedLayout>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
