import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { sanitize } from '@/lib/validation';
import { z } from 'zod';

const themeSchema = z.object({
  title: z.string().min(1).max(300).transform(sanitize),
  description: z.string().min(1).max(2000).transform(sanitize),
  icon: z.string().max(10).optional().default(''),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const theme = db.prepare('SELECT * FROM research_themes WHERE id = ?').get(id);
  if (!theme) return apiNotFound('Theme not found');
  return apiSuccess(theme);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = themeSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM research_themes WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Theme not found');

  db.prepare('UPDATE research_themes SET title=?, description=?, icon=?, sort_order=? WHERE id=?')
    .run(d.title, d.description, d.icon || '', d.sort_order, id);

  logAuditAction(user.id, 'THEME_UPDATED', `themes:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Theme updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const db = getDb();
  db.prepare('DELETE FROM research_themes WHERE id = ?').run(id);
  logAuditAction(user.id, 'THEME_DELETED', `themes:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Theme deleted' });
}
