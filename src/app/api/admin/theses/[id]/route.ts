import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { sanitize } from '@/lib/validation';
import { z } from 'zod';

const thesisSchema = z.object({
  title: z.string().min(1).max(500).transform(sanitize),
  degree: z.string().min(1).max(200).transform(sanitize),
  institution: z.string().min(1).max(500).transform(sanitize),
  supervisor: z.string().min(1).max(200).transform(sanitize),
  year: z.string().min(1).max(50).transform(sanitize),
  research_problem: z.string().min(1).max(5000).transform(sanitize),
  objective: z.string().min(1).max(5000).transform(sanitize),
  methodology: z.string().min(1).max(5000).transform(sanitize),
  key_contributions: z.string().min(1).max(5000).transform(sanitize),
  results: z.string().min(1).max(5000).transform(sanitize),
  conclusions: z.string().max(5000).optional().default(''),
  future_work: z.string().max(5000).optional().default(''),
  pdf_url: z.string().max(500).optional().default(''),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const thesis = db.prepare('SELECT * FROM theses WHERE id = ?').get(id);
  if (!thesis) return apiNotFound('Thesis not found');
  return apiSuccess(thesis);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = thesisSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM theses WHERE id = ?').get(id);
  if (!existing) return apiNotFound('Thesis not found');

  db.prepare(`
    UPDATE theses SET title=?, degree=?, institution=?, supervisor=?, year=?,
      research_problem=?, objective=?, methodology=?, key_contributions=?,
      results=?, conclusions=?, future_work=?, pdf_url=?, sort_order=?
    WHERE id = ?
  `).run(d.title, d.degree, d.institution, d.supervisor, d.year, d.research_problem, d.objective, d.methodology, d.key_contributions, d.results, d.conclusions, d.future_work, d.pdf_url || null, d.sort_order, id);

  logAuditAction(user.id, 'THESIS_UPDATED', `theses:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Thesis updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const db = getDb();
  db.prepare('DELETE FROM theses WHERE id = ?').run(id);
  logAuditAction(user.id, 'THESIS_DELETED', `theses:${id}`, getClientIp(request));
  return apiSuccess({ message: 'Thesis deleted' });
}
