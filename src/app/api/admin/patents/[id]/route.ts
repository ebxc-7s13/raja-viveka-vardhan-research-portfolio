import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { sanitize } from '@/lib/validation';
import { z } from 'zod';

const patentSchema = z.object({
  title: z.string().min(1).max(500).transform(sanitize),
  inventors: z.string().min(1).max(500).transform(sanitize),
  applicant: z.string().min(1).max(500).transform(sanitize),
  status: z.enum(['granted', 'filed', 'pending', 'search_report']),
  description: z.string().min(1).max(5000).transform(sanitize),
  innovation: z.string().min(1).max(5000).transform(sanitize),
  research_area: z.string().max(500).optional().default(''),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const patent = db.prepare('SELECT * FROM patents WHERE id = ?').get(id);
  if (!patent) return apiNotFound('Patent not found');
  return apiSuccess(patent);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = patentSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM patents WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Patent not found');

  db.prepare(`
    UPDATE patents SET title=?, inventors=?, applicant=?, status=?, description=?,
      innovation=?, research_area=?, sort_order=?
    WHERE id = ?
  `).run(d.title, d.inventors, d.applicant, d.status, d.description, d.innovation, d.research_area || '', d.sort_order, id);

  logAuditAction(user.id, 'PATENT_UPDATED', `patents:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Patent updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const db = getDb();
  db.prepare('DELETE FROM patents WHERE id = ?').run(id);
  logAuditAction(user.id, 'PATENT_DELETED', `patents:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Patent deleted' });
}
