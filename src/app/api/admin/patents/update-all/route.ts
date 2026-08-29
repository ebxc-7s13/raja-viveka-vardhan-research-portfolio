import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { z } from 'zod';

const patentUpdateSchema = z.object({
  id: z.number().int(),
  description: z.string().min(1).max(5000),
  innovation: z.string().min(1).max(5000),
});

const batchSchema = z.object({
  patents: z.array(patentUpdateSchema).min(1).max(10),
});

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const body = await request.json();
  const validation = batchSchema.safeParse(body);
  if (!validation.success) return apiError(validation.error.errors[0].message);

  const db = getDb();
  const updateStmt = db.prepare('UPDATE patents SET description = ?, innovation = ? WHERE id = ?');

  let updated = 0;
  for (const p of validation.data.patents) {
    const result = updateStmt.run(p.description, p.innovation, p.id);
    if (result.changes > 0) updated++;
  }

  logAuditAction(user.id, 'PATENTS_BATCH_UPDATE', `patents:${updated} updated`, getClientIp(request));
  return apiSuccess({ message: `${updated} patents updated`, updated });
}
