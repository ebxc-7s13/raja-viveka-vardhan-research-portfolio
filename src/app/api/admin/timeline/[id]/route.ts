import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, getClientIp } from '@/lib/api-utils';
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const entry = db.prepare('SELECT * FROM timeline WHERE id = ?').get(id);
  if (!entry) return apiNotFound('Timeline entry not found');
  return apiSuccess(entry);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = timelineSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM timeline WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Timeline entry not found');

  db.prepare('UPDATE timeline SET title=?, description=?, date=?, category=?, icon=?, sort_order=? WHERE id=?')
    .run(d.title, d.description, d.date, d.category, d.icon || '', d.sort_order, id);

  logAuditAction(user.id, 'TIMELINE_UPDATED', `timeline:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Timeline entry updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const db = getDb();
  db.prepare('DELETE FROM timeline WHERE id = ?').run(id);
  logAuditAction(user.id, 'TIMELINE_DELETED', `timeline:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Timeline entry deleted' });
}
