import axios from 'axios';

const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL = envBase && envBase.trim() ? envBase.trim() : '/api';

let inMemoryToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;
let forbiddenHandler: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

export function registerAuthHandlers(handlers: {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
}) {
  unauthorizedHandler = handlers.onUnauthorized ?? null;
  forbiddenHandler = handlers.onForbidden ?? null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/session') ||
      url.includes('/auth/bootstrap-status') ||
      url.includes('/auth/setup-admin');

    if (status === 401 && !isAuthEndpoint) {
      inMemoryToken = null;
      unauthorizedHandler?.();
    } else if (status === 403 && !isAuthEndpoint) {
      forbiddenHandler?.();
    }
    return Promise.reject(error);
  },
);
