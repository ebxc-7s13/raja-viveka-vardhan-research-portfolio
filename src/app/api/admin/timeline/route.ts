import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { sanitize } from '@/lib/validation';
import { z } from 'zod';

const timelineSchema = z.object({
  title: z.string().min(1).max(300).transform(sanitize),
  description: z.string().min(1).max(2000).transform(sanitize),
  date: z.string().min(1).max(50).transform(sanitize),
  category: z.enum(['education', 'research', 'publication', 'patent', 'project', 'startup', 'award']),
  icon: z.string().max(10).optional().default(''),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export async function GET() {
  const db = getDb();
  const entries = db.prepare('SELECT * FROM timeline ORDER BY sort_order ASC, date ASC').all();
  return apiSuccess(entries);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = timelineSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO timeline (title, description, date, category, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(d.title, d.description, d.date, d.category, d.icon || '', d.sort_order);

  logAuditAction(user.id, 'TIMELINE_CREATED', `timeline:${result.lastInsertRowid}`, getClientIp(request));
  return apiSuccess({ id: result.lastInsertRowid }, 201);
}
