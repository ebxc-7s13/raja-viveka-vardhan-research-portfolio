import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, getClientIp } from '@/lib/api-utils';
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

export async function GET() {
  const db = getDb();
  const patents = db.prepare('SELECT * FROM patents ORDER BY sort_order ASC').all();
  return apiSuccess(patents);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = patentSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const d = validation.data;
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO patents (title, inventors, applicant, status, description, innovation, research_area, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(d.title, d.inventors, d.applicant, d.status, d.description, d.innovation, d.research_area || '', d.sort_order);

  logAuditAction(user.id, 'PATENT_CREATED', `patents:${result.lastInsertRowid}`, getClientIp(request));
  return apiSuccess({ id: result.lastInsertRowid }, 201);
}
