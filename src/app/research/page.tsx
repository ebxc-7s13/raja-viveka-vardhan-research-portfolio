import { getDb } from '@/lib/db';
import Link from 'next/link';
import ProjectCarousel from '@/components/ProjectCarousel';

export const metadata = {
  title: 'Research Projects | Raja Viveka Vardhan Siluveru',
  description: 'Research projects in biomedical imaging, AI diagnostics, microgravity simulation, and medical instrumentation — presented as complete case studies.',
};

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'filed', label: 'Filed' },
] as const;

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const db = getDb();
  const params = await searchParams;
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  const isValidStatus = ['completed', 'ongoing', 'under_review', 'filed'].includes(statusFilter);

  const projects = (
    isValidStatus
      ? db.prepare('SELECT * FROM projects WHERE status = ? ORDER BY featured DESC, sort_order ASC, created_at DESC').all(statusFilter)
      : db.prepare('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, created_at DESC').all()
  ) as any[];

  // Get media counts
  const mediaCounts = db.prepare('SELECT project_id, COUNT(*) as count FROM project_media GROUP BY project_id').all() as any[];
  const countMap = new Map(mediaCounts.map((m: any) => [m.project_id, m.count]));

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-4">
            Research <span className="text-indigo-400">Projects</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Each project is presented as a complete case study — from problem formulation
            through methodology, experimentation, and results.
          </p>
          </div>
        </div>
      </section>

      {/* Status Filters */}
      <section className="max-w-6xl mx-auto px-6 pb-8" aria-label="Filter projects by status">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value || (!isValidStatus && filter.value === '');
            return (
              <Link
                key={filter.value || 'all'}
                href={filter.value ? `/research?status=${filter.value}` : '/research'}
                aria-current={isActive ? 'true' : undefined}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Projects — 3D Carousel */}
      <section className="py-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <p className="text-slate-500 text-sm text-center font-mono">Drag or use ← → arrow keys to explore</p>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 mx-6">
            <p className="text-slate-400 text-lg">
              {isValidStatus ? `No ${statusFilter.replace(/_/g, ' ')} projects right now.` : 'Research projects coming soon.'}
            </p>
            {isValidStatus && (
              <Link href="/research" className="inline-block mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">
                View all projects →
              </Link>
            )}
          </div>
        ) : (
          <ProjectCarousel
            projects={projects.map((p: any) => ({
              ...p,
              media_count: countMap.get(p.id) || 0,
            }))}
          />
        )}
      </section>
    </main>
  );
}
