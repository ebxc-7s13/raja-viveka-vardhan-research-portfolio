import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { validateBody, projectSchema } from '@/lib/validation';
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { generateSlug } from '@/lib/validation';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return apiNotFound('Project not found');
  return apiSuccess(project);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const validation = await validateBody(request, projectSchema);
  if (!validation.success) return apiError(validation.error);

  const data = validation.data;
  const slug = data.slug || generateSlug(data.title);

  const db = getDb();
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Project not found');

  // Check slug uniqueness (exclude current)
  const slugConflict = db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').get(slug, id);
  if (slugConflict) return apiError('A project with this slug already exists');

  db.prepare(`
    UPDATE projects SET
      title = ?, slug = ?, research_problem = ?, motivation = ?, approach = ?,
      methodology = ?, experimental_setup = ?, hardware = ?, data_acquisition = ?,
      computational_method = ?, results = ?, key_contribution = ?, status = ?,
      featured = ?, sort_order = ?, cover_image = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    data.title, slug, data.research_problem, data.motivation, data.approach,
    data.methodology || '', data.experimental_setup || '', data.hardware || '',
    data.data_acquisition || '', data.computational_method || '', data.results,
    data.key_contribution, data.status, data.featured ? 1 : 0, data.sort_order,
    data.cover_image || null, id
  );

  logAuditAction(user.id, 'PROJECT_UPDATED', `projects:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Project updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const db = getDb();
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Project not found');

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  logAuditAction(user.id, 'PROJECT_DELETED', `projects:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Project deleted' });
}
