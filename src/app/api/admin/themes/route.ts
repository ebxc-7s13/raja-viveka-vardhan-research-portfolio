import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { sanitize } from '@/lib/validation';
import { z } from 'zod';

const themeSchema = z.object({
  title: z.string().min(1).max(300).transform(sanitize),
  description: z.string().min(1).max(2000).transform(sanitize),
  icon: z.string().max(10).optional().default(''),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export async function GET() {
  const db = getDb();
  const themes = db.prepare('SELECT * FROM research_themes ORDER BY sort_order ASC').all();
  return apiSuccess(themes);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = themeSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO research_themes (title, description, icon, sort_order) VALUES (?, ?, ?, ?)'
  ).run(d.title, d.description, d.icon || '', d.sort_order);

  logAuditAction(user.id, 'THEME_CREATED', `themes:${result.lastInsertRowid}`, getClientIp(request));
  return apiSuccess({ id: result.lastInsertRowid }, 201);
}
