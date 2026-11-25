import axios from 'axios';

const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL = envBase && envBase.trim() ? envBase.trim() : 'http://localhost:8080';

const TOKEN_STORAGE_KEY = 'school_jwt_token';

let unauthorizedHandler: (() => void) | null = null;
let forbiddenHandler: (() => void) | null = null;

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function registerAuthHandlers(handlers: {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}): void {
  unauthorizedHandler = handlers.onUnauthorized ?? null;
  forbiddenHandler = handlers.onForbidden ?? null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url || '';
    const isLoginEndpoint = url.includes('/api/auth/login');

    if (status === 401 && !isLoginEndpoint) {
      setAuthToken(null);
      unauthorizedHandler?.();
    } else if (status === 403 && !isLoginEndpoint) {
      forbiddenHandler?.();
    }
    return Promise.reject(error);
  },
);
