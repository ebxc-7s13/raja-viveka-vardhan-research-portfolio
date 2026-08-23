import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { sanitize } from '@/lib/validation';
import { z } from 'zod';

const siteContentSchema = z.object({
  page: z.string().min(1).max(100).transform(sanitize),
  key: z.string().min(1).max(100).transform(sanitize),
  value: z.string().max(10000).default(''),
});

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const key = searchParams.get('key');

  let items;
  if (page && key) {
    items = db.prepare('SELECT * FROM site_content WHERE page = ? AND key = ?').get(page, key);
  } else if (page) {
    items = db.prepare('SELECT * FROM site_content WHERE page = ? ORDER BY key ASC').all(page);
  } else {
    items = db.prepare('SELECT * FROM site_content ORDER BY page ASC, key ASC').all();
  }

  return apiSuccess(items);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = siteContentSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();

  try {
    // Upsert - insert or update
    const result = db.prepare(`
      INSERT INTO site_content (page, key, value)
      VALUES (?, ?, ?)
      ON CONFLICT(page, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(d.page, d.key, d.value);

    logAuditAction(user.id, 'SITE_CONTENT_UPDATED', `site_content:${d.page}:${d.key}`, getClientIp(request));
    return apiSuccess({ id: result.lastInsertRowid }, 201);
  } catch (error) {
    return apiError('Failed to save content');
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return apiError('ID required');

  const db = getDb();
  db.prepare('DELETE FROM site_content WHERE id = ?').run(id);
  logAuditAction(user.id, 'SITE_CONTENT_DELETED', `site_content:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Deleted' });
}
