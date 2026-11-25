import axios from 'axios';
import type {ApiErrorShape} from '@/src/types';

export interface ParsedApiError {
  status?: number;
  message: string;
  details: Record<string, string>;
}

export function parseApiError(error: unknown, fallback = 'Something went wrong'): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiErrorShape> | undefined;
    const status = error.response?.status ?? data?.status;
    if (data && typeof data === 'object') {
      const message =
        typeof data.message === 'string' && data.message.trim()
          ? data.message
          : error.message || fallback;
      const details =
        data.details && typeof data.details === 'object' ? data.details : {};
      return {status, message, details};
    }
    return {
      status,
      message: error.message || fallback,
      details: {},
    };
  }
  if (error instanceof Error) {
    return {message: error.message || fallback, details: {}};
  }
  return {message: fallback, details: {}};
}
