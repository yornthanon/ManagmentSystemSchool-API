import type {Request, Response} from 'express';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export function paginateAndSort<T extends Record<string, unknown>>(
  items: T[],
  req: Request,
): PageResponse<T> {
  const rawPage = Number(req.query.page ?? 0);
  const rawSize = Number(req.query.size ?? 20);
  const page = Number.isFinite(rawPage) && rawPage >= 0 ? Math.floor(rawPage) : 0;
  const size = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(Math.floor(rawSize), 100) : 20;

  const sortParam = typeof req.query.sort === 'string' ? req.query.sort.trim() : '';
  const sorted = [...items];

  if (sortParam) {
    const [field, dirRaw] = sortParam.split(',');
    const desc = (dirRaw || 'asc').toLowerCase() === 'desc';
    if (field) {
      sorted.sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av == null && bv == null) return 0;
        if (av == null) return desc ? 1 : -1;
        if (bv == null) return desc ? -1 : 1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return desc ? bv - av : av - bv;
        }
        const cmp = String(av).localeCompare(String(bv), undefined, {numeric: true});
        return desc ? -cmp : cmp;
      });
    }
  }

  const totalElements = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const content = sorted.slice(start, start + size);

  return {
    content,
    totalElements,
    totalPages: totalElements === 0 ? 0 : totalPages,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1 || totalElements === 0,
    empty: content.length === 0,
  };
}

export function sendValidationError(
  res: Response,
  path: string,
  details: Record<string, string>,
  message = 'Please check the field errors below',
) {
  res.status(400).json({
    status: 400,
    error: 'Validation failed',
    message,
    details,
    path,
    timestamp: new Date().toISOString(),
  });
}

export function sendNotFound(res: Response, path: string, message = 'Resource not found') {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message,
    path,
    timestamp: new Date().toISOString(),
  });
}
