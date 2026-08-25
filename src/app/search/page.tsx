import { getDb } from '@/lib/db';
import Link from 'next/link';

export const metadata = {
  title: 'Search | Raja Viveka Vardhan Siluveru',
  description: 'Search projects, publications, notes, patents, theses, and timeline milestones',
};

// Strip LIKE wildcards to prevent wildcard injection
function escapeLike(input: string): string {
  return input.replace(/[%_\\]/g, '').trim();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const db = getDb();
  const params = await searchParams;

  const rawQuery = typeof params.q === 'string' ? params.q : '';
  const type = typeof params.type === 'string' ? params.type : 'all';
  const query = escapeLike(rawQuery).slice(0, 200);
  const hasQuery = query.length > 0;

  let projects: any[] = [];
  let publications: any[] = [];
  let posts: any[] = [];
  let patents: any[] = [];
  let theses: any[] = [];
  let timeline: any[] = [];

  if (hasQuery) {
    const like = `%${query}%`;

    if (type === 'all' || type === 'projects') {
      projects = db.prepare(
        `SELECT id, title, slug, status, featured, research_problem, results
         FROM projects
         WHERE title LIKE ? OR research_problem LIKE ? OR key_contribution LIKE ? OR results LIKE ?
            OR approach LIKE ? OR methodology LIKE ? OR hardware LIKE ? OR computational_method LIKE ?
         ORDER BY featured DESC, sort_order ASC, created_at DESC
         LIMIT 20`
      ).all(like, like, like, like, like, like, like, like) as any[];
    }

    if (type === 'all' || type === 'publications') {
      publications = db.prepare(
        `SELECT id, title, authors, journal, year, status, doi, abstract, research_area
         FROM publications
         WHERE title LIKE ? OR abstract LIKE ? OR journal LIKE ? OR research_area LIKE ? OR authors LIKE ?
         ORDER BY year DESC
         LIMIT 20`
      ).all(like, like, like, like, like) as any[];
    }

    if (type === 'all' || type === 'posts') {
      posts = db.prepare(
        `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.category, p.created_at, u.name as author_name
         FROM posts p
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.published = 1 AND (p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)
         ORDER BY p.created_at DESC
         LIMIT 20`
      ).all(like, like, like) as any[];
    }

    if (type === 'all' || type === 'patents') {
      patents = db.prepare(
        `SELECT id, title, inventors, applicant, status, description, innovation, research_area
         FROM patents
         WHERE title LIKE ? OR inventors LIKE ? OR applicant LIKE ? OR description LIKE ? OR innovation LIKE ? OR research_area LIKE ?
         ORDER BY sort_order ASC, created_at DESC
         LIMIT 20`
      ).all(like, like, like, like, like, like) as any[];
    }

    if (type === 'all' || type === 'theses') {
      theses = db.prepare(
        `SELECT id, title, degree, institution, supervisor, year, research_problem, objective, methodology, key_contributions, results
         FROM theses
         WHERE title LIKE ? OR degree LIKE ? OR institution LIKE ? OR supervisor LIKE ? OR research_problem LIKE ? OR objective LIKE ? OR methodology LIKE ? OR key_contributions LIKE ? OR results LIKE ?
         ORDER BY year DESC
         LIMIT 20`
      ).all(like, like, like, like, like, like, like, like, like) as any[];
    }

    if (type === 'all' || type === 'timeline') {
      timeline = db.prepare(
        `SELECT id, title, description, date, category
         FROM timeline
         WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
         ORDER BY sort_order ASC
         LIMIT 20`
      ).all(like, like, like) as any[];
    }
  }

  const totalResults = projects.length + publications.length + posts.length + patents.length + theses.length + timeline.length;
  const noResults = hasQuery && totalResults === 0;
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'projects', label: 'Projects' },
    { value: 'publications', label: 'Publications' },
    { value: 'posts', label: 'Research Notes' },
    { value: 'patents', label: 'Patents' },
    { value: 'theses', label: 'Theses' },
    { value: 'timeline', label: 'Timeline' },
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
            Search <span className="text-indigo-400">Everything</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Find projects, publications, notes, patents, theses, and milestones across the portfolio.
          </p>
          </div>
        </div>
      </section>

      {/* Search Form — plain GET form, works without client JS */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <form action="/search" method="get" role="search"
          className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="q"
              maxLength={200}
              placeholder="Search projects, publications, notes, patents, theses, timeline..."
              aria-label="Search query"
              defaultValue={rawQuery}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-colors"
            />
            <select
              name="type"
              aria-label="Search category"
              defaultValue={type}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-colors sm:w-48"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-6 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Search
            </button>
          </div>
        </form>

        {hasQuery && (
          <p className="text-sm text-slate-500 mt-4 px-1" role="status">
            {noResults
              ? <>No results for <span className="text-slate-300 font-medium">{query}</span></>
              : <>{totalResults} result{totalResults === 1 ? '' : 's'} for <span className="text-indigo-400 font-medium">{query}</span></>}
          </p>
        )}
      </section>

      {/* Empty states */}
      {!hasQuery && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <svg className="w-14 h-14 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-slate-400 text-lg">Enter keywords above to search the portfolio.</p>
          </div>
        </section>
      )}

      {noResults && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <svg className="w-14 h-14 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-slate-400 text-lg">Nothing matched <em className="text-slate-300">{query}</em>.</p>
            <p className="text-slate-500 text-sm mt-2">Try different keywords, or browse everything below.</p>
          </div>
        </section>
      )}

      {/* Results */}
      {hasQuery && !noResults && (
        <section className="max-w-6xl mx-auto px-6 pb-16 space-y-12">
          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full" aria-hidden="true" />
                Projects ({projects.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {projects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/research/${project.slug}`}
                    className="block group bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        project.status === 'ongoing' ? 'bg-blue-500/10 text-blue-400' :
                        project.status === 'under_review' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {String(project.status).replace(/_/g, ' ')}
                      </span>
                      {project.featured ? <span className="text-xs text-amber-400 font-medium">Featured</span> : null}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-400 transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{project.research_problem}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Publications */}
          {publications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-3 h-3 bg-violet-400 rounded-full" aria-hidden="true" />
                Publications ({publications.length})
              </h2>
              <div className="space-y-4">
                {publications.map((pub: any) => (
                  <div key={pub.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300">
                        {String(pub.status).replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500">{pub.year}</span>
                      {pub.journal && <span className="text-xs text-slate-500">· {pub.journal}</span>}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{pub.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{pub.authors}</p>
                    {pub.doi && (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">
                        DOI ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Notes */}
          {posts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-400 rounded-full" aria-hidden="true" />
                Research Notes ({posts.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block group bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-emerald-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {post.category && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {String(post.category).replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-emerald-400 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{post.author_name || 'Researcher'}</span>
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Patents */}
          {patents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-400 rounded-full" aria-hidden="true" />
                Patents ({patents.length})
              </h2>
              <div className="space-y-4">
                {patents.map((patent: any) => (
                  <div key={patent.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        patent.status === 'granted' ? 'bg-emerald-500/10 text-emerald-400' :
                        patent.status === 'filed' ? 'bg-blue-500/10 text-blue-400' :
                        patent.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {String(patent.status).replace(/_/g, ' ')}
                      </span>
                      {patent.research_area && (
                        <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">{patent.research_area}</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{patent.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{patent.inventors}</p>
                    <p className="text-sm text-slate-400 line-clamp-2">{patent.description || patent.innovation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theses */}
          {theses.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-400 rounded-full" aria-hidden="true" />
                Theses ({theses.length})
              </h2>
              <div className="space-y-4">
                {theses.map((thesis: any) => (
                  <div key={thesis.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-400">
                        {thesis.degree}
                      </span>
                      <span className="text-xs text-slate-500">{thesis.year}</span>
                      <span className="text-xs text-slate-500">· {thesis.institution}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{thesis.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">Supervisor: {thesis.supervisor}</p>
                    <p className="text-sm text-slate-400 line-clamp-2">{thesis.research_problem || thesis.objective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full" aria-hidden="true" />
                Timeline ({timeline.length})
              </h2>
              <div className="space-y-4">
                {timeline.map((item: any) => (
                  <div key={item.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300">
                        {String(item.category).replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browse all */}
          <div className="grid md:grid-cols-3 gap-4 pt-8 border-t border-slate-800">
            <Link href="/research" className="bg-slate-900/50 rounded-xl border border-slate-800 text-center py-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              Browse All Research Projects
            </Link>
            <Link href="/publications" className="bg-slate-900/50 rounded-xl border border-slate-800 text-center py-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-violet-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
              Browse All Publications
            </Link>
            <Link href="/blog" className="bg-slate-900/50 rounded-xl border border-slate-800 text-center py-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              Browse All Research Notes
            </Link>
            <Link href="/patents" className="bg-slate-900/50 rounded-xl border border-slate-800 text-center py-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-purple-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
              Browse All Patents
            </Link>
            <Link href="/thesis" className="bg-slate-900/50 rounded-xl border border-slate-800 text-center py-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-cyan-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">
              Browse All Theses
            </Link>
            <Link href="/timeline" className="bg-slate-900/50 rounded-xl border border-slate-800 text-center py-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-amber-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
              Browse Full Timeline
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
