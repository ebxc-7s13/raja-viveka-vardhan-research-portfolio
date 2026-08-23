import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { sanitize } from '@/lib/validation';
import { z } from 'zod';
import path from 'path';

const ALLOWED_MEDIA_ROOT = path.join(process.cwd(), 'public', 'research');

function isPathInAllowedRoot(userPath: string): boolean {
  // Normalize the user path to resolve any .. or . segments
  // Convert to forward slashes for consistent prefix check
  const normalized = path.normalize(userPath).replace(/\\/g, '/');
  // Ensure it starts with /research/ (for URL consistency)
  if (!normalized.startsWith('/research/')) return false;
  // Resolve the full filesystem path
  const fullPath = path.join(process.cwd(), 'public', normalized);
  const resolvedFull = path.resolve(fullPath);
  const resolvedAllowed = path.resolve(ALLOWED_MEDIA_ROOT);
  // Ensure the resolved path is within the allowed root
  return resolvedFull.startsWith(resolvedAllowed + path.sep) || resolvedFull === resolvedAllowed;
}

const mediaSchema = z.object({
  project_id: z.number().int().positive(),
  file_path: z.string().min(1).max(500).transform(sanitize).refine(
    (p) => isPathInAllowedRoot(p),
    'File path must be within the allowed research media directory'
  ),
  media_type: z.enum(['image', 'video', 'document']),
  caption: z.string().max(500).optional().default('').transform(sanitize),
  caption_title: z.string().max(300).optional().default('').transform(sanitize),
  section: z.string().max(100).optional().default('').transform(sanitize),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const db = getDb();

  let media;
  if (projectId) {
    media = db.prepare('SELECT * FROM project_media WHERE project_id = ? ORDER BY sort_order ASC').all(projectId);
  } else {
    media = db.prepare('SELECT pm.*, p.slug as project_slug FROM project_media pm JOIN projects p ON pm.project_id = p.id ORDER BY pm.sort_order ASC').all();
  }
  return apiSuccess(media);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = mediaSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();    const result = db.prepare(
      'INSERT INTO project_media (project_id, file_path, media_type, caption, caption_title, section, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(d.project_id, d.file_path, d.media_type, d.caption || '', d.caption_title || '', d.section || '', d.sort_order);

  logAuditAction(user.id, 'MEDIA_CREATED', `media:${result.lastInsertRowid}`, getClientIp(request));
  return apiSuccess({ id: result.lastInsertRowid }, 201);
}

export async function DELETE(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return apiError('ID required');

  const db = getDb();
  db.prepare('DELETE FROM project_media WHERE id = ?').run(id);
  logAuditAction(user.id, 'MEDIA_DELETED', `media:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Deleted' });
}
