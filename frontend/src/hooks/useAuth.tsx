import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {authApi} from '@/src/api/auth';
import {getAuthToken, registerAuthHandlers, setAuthToken} from '@/src/api/axios';
import type {Role, User} from '@/src/types';

export function getRoleHomePath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/my-classes';
    case 'STUDENT':
      return '/student/my-grades';
  }
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getAuthToken()));

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerAuthHandlers({
      onUnauthorized: () => {
        clearSession();
        toast.error('Your session expired. Please sign in again.');
        navigate('/login', {replace: true});
      },
      onForbidden: () => {
        navigate('/forbidden', {replace: true});
      },
    });
  }, [clearSession, navigate]);

  useEffect(() => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let active = true;
    authApi
      .me()
      .then((me) => {
        if (!active) return;
        setUser(me);
        setToken(storedToken);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authApi.login({email, password});
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate('/login', {replace: true});
  }, [clearSession, navigate]);

  return (
    <AuthContext.Provider value={{user, token, isLoading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
