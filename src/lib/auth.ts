import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getDb } from './db';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set');
  }
  return new TextEncoder().encode(secret);
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = 'auth-token';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Hash password with bcrypt (12 rounds)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuer('secure-portfolio')
    .setAudience('secure-portfolio-users')
    .sign(JWT_SECRET);

  // Store token hash in sessions table for revocation
  const db = getDb();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
  ).run(user.id, tokenHash, expiresAt);

  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'secure-portfolio',
      audience: 'secure-portfolio-users',
    });

    // Check if token is revoked
    const db = getDb();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = db
      .prepare('SELECT revoked FROM sessions WHERE token_hash = ?')
      .get(tokenHash) as { revoked: number } | undefined;

    if (session?.revoked) return null;

    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// Set auth cookie (httpOnly, secure, sameSite)
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,       // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',   // CSRF protection
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Get auth token from cookies
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

// Revoke all sessions for a user
export function revokeAllSessions(userId: number) {
  const db = getDb();
  db.prepare('UPDATE sessions SET revoked = 1 WHERE user_id = ?').run(userId);
}

// Get current user from request
export async function getCurrentUser(
  request?: NextRequest
): Promise<User | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    token = await getAuthToken();
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const db = getDb();    const user = db
      .prepare('SELECT id, email, name, role FROM users WHERE id = ?')
      .get(Number(payload.sub)) as User | undefined;

  return user || null;
}

// Require authenticated user (throws if not)
export async function requireAuth(request?: NextRequest): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Require admin role
export async function requireAdmin(request?: NextRequest): Promise<User> {
  const user = await requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}

// Audit log
export function logAuditAction(
  userId: number | null,
  action: string,
  resource?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: string
) {
  const db = getDb();
  db.prepare(
    `INSERT INTO audit_log (user_id, action, resource, ip_address, user_agent, details)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(userId, action, resource, ipAddress, userAgent, details);
}
