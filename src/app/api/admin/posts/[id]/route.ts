import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { validateBody, postSchema } from '@/lib/validation';
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { generateSlug } from '@/lib/validation';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const post = db.prepare('SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?').get(id);
  if (!post) return apiNotFound('Post not found');
  return apiSuccess(post);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const validation = await validateBody(request, postSchema);
  if (!validation.success) return apiError(validation.error);

  const { title, slug, content, excerpt, cover_image, published } = validation.data;
  const finalSlug = slug || generateSlug(title);

  const db = getDb();
  const existing = db.prepare('SELECT id FROM posts WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Post not found');

  const slugConflict = db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(finalSlug, id);
  if (slugConflict) return apiError('A post with this slug already exists');

  db.prepare(`
    UPDATE posts SET
      title = ?, slug = ?, content = ?, excerpt = ?, cover_image = ?,
      published = ?, published_at = CASE WHEN ? = 1 AND published = 0 THEN CURRENT_TIMESTAMP ELSE published_at END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, finalSlug, content, excerpt, cover_image || null, published ? 1 : 0, published ? 1 : 0, id);

  logAuditAction(user.id, 'POST_UPDATED', `posts:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Post updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const db = getDb();
  const existing = db.prepare('SELECT id FROM posts WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Post not found');

  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  logAuditAction(user.id, 'POST_DELETED', `posts:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Post deleted' });
}
