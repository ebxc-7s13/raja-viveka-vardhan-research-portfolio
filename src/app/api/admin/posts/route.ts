import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { validateBody, postSchema } from '@/lib/validation';
import { apiSuccess, apiError, apiUnauthorized, apiPaginated, getClientIp } from '@/lib/api-utils';

// GET: List posts (admin view - includes drafts)
export async function GET(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as any).count;
  const posts = db
    .prepare(
      `SELECT p.*, u.name as author_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset);

  return apiPaginated(posts, total, page, limit);
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const validation = await validateBody(request, postSchema);
  if (!validation.success) {
    return apiError(validation.error);
  }

  const { title, slug, content, excerpt, cover_image, published } = validation.data;

  // Check for duplicate slug
  const db = getDb();
  const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
  if (existing) {
    return apiError('A post with this slug already exists');
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO posts (title, slug, content, excerpt, cover_image, published, author_id, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        title,
        slug,
        content,
        excerpt,
        cover_image || null,
        published ? 1 : 0,
        user.id,
        published ? new Date().toISOString() : null
      );

    logAuditAction(user.id, 'POST_CREATED', `posts:${result.lastInsertRowid}`, getClientIp(request));

    return apiSuccess({ id: result.lastInsertRowid }, 201);
  } catch (error) {
    return apiError('Failed to create post');
  }
}
