import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {getRoleHomePath, useAuth} from '@/src/hooks/useAuth';
import type {Role} from '@/src/types';

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const {user, isLoading} = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg border-2 border-[#4F5DF5] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({children}: {children: React.ReactNode}) {
  const {user, isLoading} = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg border-2 border-[#4F5DF5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
}

export function RoleHomeRedirect() {
  const {user, isLoading} = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg border-2 border-[#4F5DF5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleHomePath(user.role)} replace />;
}
