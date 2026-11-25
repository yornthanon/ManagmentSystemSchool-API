import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {authApi} from '@/src/api/auth';
import {registerAuthHandlers, setAuthToken} from '@/src/api/axios';
import type {Role, User} from '@/src/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  needsAdminSetup: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  setupAdmin: (payload: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);

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
    let active = true;
    async function bootstrap() {
      try {
        const [statusRes, sessionRes] = await Promise.all([
          authApi.getBootstrapStatus(),
          authApi.getSession(),
        ]);
        if (!active) return;
        setNeedsAdminSetup(Boolean(statusRes?.needsAdminSetup));
        if (sessionRes?.token && sessionRes?.user) {
          setAuthToken(sessionRes.token);
          setToken(sessionRes.token);
          setUser(sessionRes.user);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({email, password});
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setNeedsAdminSetup(false);
  }, []);

  const register = useCallback(
    async (payload: {username: string; email: string; password: string; fullName: string}) => {
      const res = await authApi.register(payload);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    },
    [],
  );

  const setupAdmin = useCallback(
    async (payload: {username: string; email: string; password: string; fullName: string}) => {
      const res = await authApi.setupAdmin(payload);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setNeedsAdminSetup(false);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on stateless logout
    }
    clearSession();
    navigate('/login', {replace: true});
  }, [clearSession, navigate]);

  const refreshUser = useCallback(async () => {
    const fresh = await authApi.me();
    setUser(fresh);
  }, []);

  const hasRole = useCallback(
    (roles: Role[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        needsAdminSetup,
        login,
        register,
        setupAdmin,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
