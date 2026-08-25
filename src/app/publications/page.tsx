import { getDb } from '@/lib/db';
import Link from 'next/link';

export const metadata = {
  title: 'Publications | Raja Viveka Vardhan Siluveru',
  description: 'Peer-reviewed manuscripts and research publications in biomedical imaging, deep learning, and cancer screening.',
};

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'published', label: 'Published' },
] as const;

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const db = getDb();
  const params = await searchParams;
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  const isValidStatus = ['under_review', 'accepted', 'published'].includes(statusFilter);

  const allPublications = db.prepare(
    'SELECT * FROM publications ORDER BY year DESC, sort_order ASC'
  ).all() as any[];

  // Apply status filter when valid
  const publications = isValidStatus
    ? allPublications.filter((p: any) => p.status === statusFilter)
    : allPublications;

  const underReview = publications.filter((p: any) => p.status === 'under_review');
  const published = publications.filter((p: any) => p.status === 'published' || p.status === 'accepted');

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Publications
          </div>
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-6">
            Publications & <span className="text-violet-400">Manuscripts</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Peer-reviewed manuscripts in biomedical imaging, deep learning, and cancer screening.
          </p>
          </div>
        </div>
      </section>

      {/* Status Filters */}
      <section className="max-w-4xl mx-auto px-6 pb-8" aria-label="Filter publications by status">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value || (!isValidStatus && filter.value === '');
            return (
              <Link
                key={filter.value || 'all'}
                href={filter.value ? `/publications?status=${filter.value}` : '/publications'}
                aria-current={isActive ? 'true' : undefined}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-300 border-violet-500/40'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        {/* Under Review */}
        {underReview.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-400 rounded-full" aria-hidden="true" />
              Under Review ({underReview.length})
            </h2>
            <div className="space-y-4">
              {underReview.map((pub: any) => (
                <div key={pub.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 hover:border-amber-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Under Review</span>
                    <span className="text-xs text-slate-500">{pub.year}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{pub.title}</h3>
                  <p className="text-sm text-slate-400 mb-1">{pub.authors}</p>
                  <p className="text-sm text-slate-500 italic mb-4">{pub.journal}</p>
                  {pub.abstract && (
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-3">{pub.abstract}</p>
                  )}
                  <div className="flex items-center gap-4">
                    {pub.research_area && (
                      <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
                        {pub.research_area}
                      </span>
                    )}
                    {pub.doi && (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">
                        DOI ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Published */}
        {published.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full" aria-hidden="true" />
              Published / Accepted ({published.length})
            </h2>
            <div className="space-y-4">
              {published.map((pub: any) => (
                <div key={pub.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      pub.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {pub.status.charAt(0).toUpperCase() + pub.status.slice(1)}
                    </span>
                    <span className="text-xs text-slate-500">{pub.year}</span>
                    {pub.journal && <span className="text-xs text-slate-500">· {pub.journal}</span>}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{pub.title}</h3>
                  <p className="text-sm text-slate-400 mb-1">{pub.authors}</p>
                  {pub.abstract && (
                    <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-3">{pub.abstract}</p>
                  )}
                  <div className="flex items-center gap-4">
                    {pub.research_area && (
                      <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
                        {pub.research_area}
                      </span>
                    )}
                    {pub.doi && (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">
                        DOI ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {publications.length === 0 && (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400 text-lg">
              {isValidStatus
                ? <>No <span className="text-slate-300">{statusFilter.replace(/_/g, ' ')}</span> publications right now.</>
                : 'Publications will appear here as manuscripts are submitted.'}
            </p>
            {isValidStatus && (
              <Link href="/publications" className="inline-block mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">
                View all publications →
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
