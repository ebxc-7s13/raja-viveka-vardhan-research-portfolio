import { getDb } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Research Notes | Raja Viveka Vardhan Siluveru',
  description: 'Technical notes on biomedical imaging, optical systems, AI/ML methods, and experimental research.',
};

export default async function ResearchNotesPage() {
  const db = getDb();
  const posts = db.prepare(
    `SELECT p.*, u.name as author_name FROM posts p 
     LEFT JOIN users u ON p.author_id = u.id 
     WHERE p.published = 1 
     ORDER BY p.created_at DESC`
  ).all() as any[];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Research Notes
          </div>
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-6">
            Research <span className="text-emerald-400">Notes</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Technical observations, methodology notes, experimental insights, and research progress updates.
          </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No Notes Yet</h3>
            <p className="text-slate-500">Research notes will appear here as they are published.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden hover:border-emerald-500/30 transition-all duration-300"
              >
                {post.cover_image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{post.author_name || 'Researcher'}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
