import { NextRequest } from 'next/server';
import { getCurrentUser, clearAuthCookie, revokeAllSessions, logAuditAction } from '@/lib/auth';
import { apiSuccess, getClientIp, getUserAgent } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (user) {
    // Revoke all sessions for this user
    revokeAllSessions(user.id);

    // Audit log
    const ip = getClientIp(request);
    const ua = getUserAgent(request);
    logAuditAction(user.id, 'LOGOUT', 'auth', ip, ua);
  }

  // Clear the auth cookie
  await clearAuthCookie();

  return apiSuccess({ message: 'Logged out successfully' });
}
