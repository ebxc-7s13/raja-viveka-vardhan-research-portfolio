import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiPaginated, getClientIp } from '@/lib/api-utils';

// GET: List messages
export async function GET(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const showAll = searchParams.get('all') === 'true';
  const offset = (page - 1) * limit;

  const db = getDb();

  const whereClause = showAll ? '' : 'WHERE read = 0';
  const total = (
    db.prepare(`SELECT COUNT(*) as count FROM messages ${whereClause}`).get() as any
  ).count;

  const messages = db
    .prepare(
      `SELECT * FROM messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(limit, offset);

  // Mark displayed messages as read
  if (!showAll) {
    const ids = (messages as any[]).map((m: any) => m.id);
    if (ids.length > 0) {
      db.prepare(
        `UPDATE messages SET read = 1 WHERE id IN (${ids.map(() => '?').join(',')})`
      ).run(...ids);
    }
  }

  logAuditAction(user.id, 'MESSAGES_VIEWED', 'messages', getClientIp(request));

  return apiPaginated(messages, total, page, limit);
}
