import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Trust proxy configuration - only trust x-forwarded-for if behind known proxy
const TRUST_PROXY = process.env.TRUSTED_PROXY === 'true';

function getClientIpFromRequest(request: Request): string {
  if (TRUST_PROXY) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIp) {
      return realIp;
    }
  }
  return 'unknown';
}

// Standard API responses
export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiUnauthorized(message = 'Authentication required') {
  return apiError(message, 401);
}

export function apiForbidden(message = 'Insufficient permissions') {
  return apiError(message, 403);
}

export function apiNotFound(message = 'Resource not found') {
  return apiError(message, 404);
}

export function apiInternal(message = 'Internal server error') {
  return apiError(message, 500);
}

// CSRF token generation and verification
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCsrfToken(
  token: string,
  sessionToken: string
): boolean {
  if (!token || !sessionToken) return false;
  const tokenBuf = Buffer.from(token, 'hex');
  const sessionBuf = Buffer.from(sessionToken, 'hex');
  if (tokenBuf.length !== sessionBuf.length) return false;
  return crypto.timingSafeEqual(tokenBuf, sessionBuf);
}

// Content-Type validation
export function validateContentType(
  request: Request,
  expected: string = 'application/json'
): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes(expected) || false;
}

// Get client IP from request (respects TRUSTED_PROXY env var)
export function getClientIp(request: Request): string {
  return getClientIpFromRequest(request);
}

// Get user agent
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent')?.slice(0, 500) || 'unknown';
}

// Security headers for API responses
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

// Sanitize error messages for production
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'Unknown error';
  }
  // Don't leak internal errors in production
  return 'An unexpected error occurred';
}

// CORS helper
export function withCors(
  response: NextResponse,
  origin?: string
): NextResponse {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
  const requestOrigin = origin || '';

  if (allowedOrigins.includes(requestOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

// Paginated response
export function apiPaginated(
  data: unknown[],
  total: number,
  page: number,
  limit: number
) {
  return apiSuccess({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}
