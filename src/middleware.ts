import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : null;

const COOKIE_NAME = 'auth-token';

// Routes that ALWAYS require admin auth (even GET)
const ALWAYS_PROTECTED = [
  '/api/admin/messages',
  '/api/admin/site-content',
  '/api/admin/media',
  '/api/cron/',
];

// Routes that require auth for mutations (POST/PUT/DELETE) but allow public GET
const MUTATION_PROTECTED = [
  '/api/admin/',
];

// Routes that require any authenticated user
const AUTH_ROUTES = [
  '/api/auth/me',
  '/api/auth/logout',
];

async function verifyJwt(token: string): Promise<boolean> {
  if (!JWT_SECRET) return false;
  try {
    await jwtVerify(token, JWT_SECRET, {
      issuer: 'secure-portfolio',
      audience: 'secure-portfolio-users',
    });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if route always requires admin auth (all methods)
  const alwaysProtected = ALWAYS_PROTECTED.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route requires auth for mutations only
  const mutationProtected = MUTATION_PROTECTED.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route requires any auth
  const requiresAuth = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const needsAuth =
    alwaysProtected ||
    (mutationProtected && method !== 'GET') ||
    requiresAuth;

  if (needsAuth) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isValid = await verifyJwt(token);
    if (!isValid) {
      // Clear invalid cookie
      const response = NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  // Add security headers to all API responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
