import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-utils';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// It cleans up expired sessions and old audit log entries
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return apiError('Unauthorized', 401);
  }

  const db = getDb();

  // Clean up expired sessions
  const expiredSessions = db.prepare(
    'DELETE FROM sessions WHERE expires_at < datetime(\'now\')'
  ).run();

  // Clean up audit log entries older than 90 days
  const oldAuditLogs = db.prepare(
    'DELETE FROM audit_log WHERE created_at < datetime(\'now\', \'-90 days\')'
  ).run();

  return apiSuccess({
    message: 'Cleanup completed',
    expiredSessionsRemoved: expiredSessions.changes,
    oldAuditLogsRemoved: oldAuditLogs.changes,
  });
}
