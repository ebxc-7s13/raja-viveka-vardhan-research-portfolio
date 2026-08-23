import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, getClientIp } from '@/lib/api-utils';
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

export async function GET() {
  const db = getDb();
  const theses = db.prepare('SELECT * FROM theses ORDER BY sort_order ASC, year DESC').all();
  return apiSuccess(theses);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = thesisSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO theses (title, degree, institution, supervisor, year, research_problem, objective, methodology, key_contributions, results, conclusions, future_work, pdf_url, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(d.title, d.degree, d.institution, d.supervisor, d.year, d.research_problem, d.objective, d.methodology, d.key_contributions, d.results, d.conclusions, d.future_work, d.pdf_url || null, d.sort_order);

  logAuditAction(user.id, 'THESIS_CREATED', `theses:${result.lastInsertRowid}`, getClientIp(request));
  return apiSuccess({ id: result.lastInsertRowid }, 201);
}
