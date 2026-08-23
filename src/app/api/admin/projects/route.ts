import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin, logAuditAction } from '@/lib/auth';
import { validateBody, projectSchema } from '@/lib/validation';
import { apiSuccess, apiError, apiUnauthorized, getClientIp } from '@/lib/api-utils';
import { generateSlug } from '@/lib/validation';

// GET: List all projects
export async function GET() {
  const db = getDb();
  const projects = db
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC')
    .all();

  return apiSuccess(projects);
}

// POST: Create a new project
export async function POST(request: NextRequest) {
  const user = await requireAdmin(request).catch(() => null);
  if (!user) return apiUnauthorized();

  const validation = await validateBody(request, projectSchema);
  if (!validation.success) {
    return apiError(validation.error);
  }

  const data = validation.data;
  const slug = data.slug || generateSlug(data.title);

  const db = getDb();
  try {
    const result = db
      .prepare(
        `INSERT INTO projects (title, slug, research_problem, motivation, approach, methodology, experimental_setup, hardware, data_acquisition, computational_method, results, key_contribution, status, featured, sort_order, cover_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.title,
        slug,
        data.research_problem,
        data.motivation,
        data.approach,
        data.methodology,
        data.experimental_setup,
        data.hardware,
        data.data_acquisition,
        data.computational_method,
        data.results,
        data.key_contribution,
        data.status,
        data.featured ? 1 : 0,
        data.sort_order,
        data.cover_image || null
      );

    logAuditAction(user.id, 'PROJECT_CREATED', `projects:${result.lastInsertRowid}`, getClientIp(request));

    return apiSuccess({ id: result.lastInsertRowid }, 201);
  } catch (error) {
    return apiError('Failed to create project');
  }
}
