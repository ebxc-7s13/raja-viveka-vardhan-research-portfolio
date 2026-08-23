import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie, logAuditAction } from '@/lib/auth';
import { validateBody, loginSchema } from '@/lib/validation';
import { authLimiter, applyRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError, getClientIp, getUserAgent } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(request, authLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  // Validate input
  const validation = await validateBody(request, loginSchema);
  if (!validation.success) {
    return apiError(validation.error);
  }

  const { email, password } = validation.data;
  const ip = getClientIp(request);
  const ua = getUserAgent(request);

  const db = getDb();

  // Find user
  const user = db
    .prepare('SELECT id, email, password_hash, name, role FROM users WHERE email = ?')
    .get(email) as { id: number; email: string; password_hash: string; name: string; role: string } | undefined;

  if (!user) {
    // Log failed attempt (don't reveal if user exists)
    logAuditAction(null, 'LOGIN_FAILED', 'auth', ip, ua, `Email: ${email}`);
    return apiError('Invalid email or password', 401);
  }

  // Verify password
  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    logAuditAction(user.id, 'LOGIN_FAILED', 'auth', ip, ua, 'Invalid password');
    return apiError('Invalid email or password', 401);
  }

  // Create JWT and set cookie
  const token = await createToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  setAuthCookie(token);

  // Audit log
  logAuditAction(user.id, 'LOGIN_SUCCESS', 'auth', ip, ua);

  return apiSuccess({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
