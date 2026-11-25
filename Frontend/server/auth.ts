import crypto from 'crypto';
import type {NextFunction, Request, Response} from 'express';
import {sanitizeUser, store} from './store.ts';
import type {PublicUser, Role, UserRecord} from './types.ts';

const RUNTIME_JWT_SECRET = crypto.randomBytes(32).toString('hex');

function getJwtSecret(): string {
  return process.env.JWT_SECRET?.trim() || RUNTIME_JWT_SECRET;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  if (!salt || !originalHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const original = Buffer.from(originalHex, 'hex');
    if (derived.length !== original.length) return false;
    return crypto.timingSafeEqual(derived, original);
  } catch {
    return false;
  }
}

interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  exp: number;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const padLen = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function signJwt(user: UserRecord): string {
  const header = base64UrlEncode(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${header}.${encodedPayload}`)
    .digest();
  return `${header}.${encodedPayload}.${base64UrlEncode(signature)}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    const expectedSig = base64UrlEncode(
      crypto.createHmac('sha256', getJwtSecret()).update(`${header}.${payload}`).digest(),
    );
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const decoded = JSON.parse(base64UrlDecode(payload)) as JwtPayload;
    if (!decoded.sub || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  }
  return result;
}

export function setSessionCookie(res: Response, token: string): void {
  res.setHeader(
    'Set-Cookie',
    `school_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=86400`,
  );
}

export function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    'school_session=; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=0',
  );
}

export interface AuthenticatedRequest extends Request {
  currentUser?: PublicUser;
  authToken?: string;
}

export function extractTokenAndUser(req: Request): {
  token: string | null;
  user: PublicUser | null;
  fromCookie: boolean;
} {
  const authHeader = req.headers.authorization;
  let token: string | null = null;
  let fromCookie = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    const cookies = parseCookies(req);
    if (cookies.school_session) {
      token = cookies.school_session;
      fromCookie = true;
    }
  }

  if (!token) return {token: null, user: null, fromCookie: false};
  const payload = verifyJwt(token);
  if (!payload) return {token: null, user: null, fromCookie};
  const user = store.getState().users.find((u) => u.id === payload.sub && u.active);
  if (!user) return {token: null, user: null, fromCookie};
  return {token, user: sanitizeUser(user), fromCookie};
}

function verifyCsrfForCookieMutation(req: Request): boolean {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') return true;
  const origin = req.headers.origin;
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }
  return false;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const {token, user, fromCookie} = extractTokenAndUser(req);
  if (!user || !token) {
    res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in.',
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  if (fromCookie && !verifyCsrfForCookieMutation(req)) {
    res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Invalid request origin for session mutation.',
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  req.currentUser = user;
  req.authToken = token;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.currentUser) {
      res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Authentication required.',
        path: req.path,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (!roles.includes(req.currentUser.role)) {
      res.status(403).json({
        status: 403,
        error: 'Forbidden',
        message: 'You do not have permission to perform this action.',
        path: req.path,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    next();
  };
}
