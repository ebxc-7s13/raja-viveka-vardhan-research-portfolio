import { getDb } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';

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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Research <span className="text-indigo-400">Projects</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Each project is presented as a complete case study — from problem formulation
            through methodology, experimentation, and results.
          </p>
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

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
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
          <div className="space-y-6">
            {projects.map((project: any) => {
              const mediaCount = countMap.get(project.id) || 0;
              return (
                <Link
                  key={project.id}
                  href={`/research/${project.slug}`}
                  className="block group bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="md:flex">
                    {/* Cover Image */}
                    {project.cover_image && (
                      <div className="md:w-72 h-48 md:h-auto flex-shrink-0 relative overflow-hidden">
                        <Image
                          src={project.cover_image}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 288px"
                        />
                      </div>
                    )}

                    <div className="p-5 md:p-6 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          project.status === 'ongoing' ? 'bg-blue-500/10 text-blue-400' :
                          project.status === 'under_review' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {String(project.status).replace(/_/g, ' ')}
                        </span>
                        {project.featured ? <span className="text-xs text-amber-400 font-medium">Featured</span> : null}
                        {mediaCount > 0 && (
                          <span className="text-xs text-slate-500">{mediaCount} media</span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors leading-snug">
                        {project.title}
                      </h2>

                      {/* Problem → Results preview */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-3">
                        {project.research_problem && (
                          <div className="flex-1">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Problem</p>
                            <p className="text-sm text-slate-400 line-clamp-2">{project.research_problem}</p>
                          </div>
                        )}
                        {project.results && (
                          <div className="flex-1">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Key Result</p>
                            <p className="text-sm text-slate-400 line-clamp-2">{project.results}</p>
                          </div>
                        )}
                      </div>

                      <span className="text-sm text-indigo-400 font-medium inline-flex items-center gap-1">
                        View case study
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
