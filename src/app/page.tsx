import { getDb } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import ImageCrossFade from '@/components/ImageCrossFade';

export default function Home() {
  const db = getDb();
  const projects = db.prepare('SELECT * FROM projects ORDER BY featured DESC, created_at DESC LIMIT 3').all() as any[];
  const posts = db.prepare(
    `SELECT p.*, u.name as author_name FROM posts p 
     LEFT JOIN users u ON p.author_id = u.id 
     WHERE p.published = 1 
     ORDER BY p.created_at DESC LIMIT 3`
  ).all() as any[];
  const publications = db.prepare(
    "SELECT * FROM publications WHERE status IN ('published', 'accepted') ORDER BY year DESC LIMIT 3"
  ).all() as any[];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Research Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-950 to-violet-950/30" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Biomedical Engineering Researcher
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Siluveru
                </span>
                <br />
                Raja Viveka Vardhan
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed mb-8 max-w-lg">
                Engineering researcher developing label-free imaging systems and 
                computational methods for early disease detection — at the intersection 
                of optical imaging, AI/ML, and non-invasive diagnostics.
              </p>

              {/* Research areas */}
              <div className="flex flex-wrap gap-2 mb-10">
                {['Multispectral Imaging', 'Deep Learning', 'Oral Cancer Detection', 'Optical Instrumentation', 'Non-Invasive Diagnostics'].map((area) => (
                  <span key={area} className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50">
                    {area}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/research"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
                >
                  Explore Research
                </Link>
                <Link
                  href="/publications"
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 transition-colors"
                >
                  View Publications
                </Link>
                <Link
                  href="/thesis"
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 transition-colors"
                >
                  Read Thesis
                </Link>
              </div>
            </div>

            {/* Hero Image Grid */}
            <div className="relative hidden lg:flex items-center justify-center">
              <ImageCrossFade />
              {/* Floating stats */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-800 p-4">
                <div className="text-3xl font-bold text-white">2+</div>
                <div className="text-sm text-slate-400">Theses Completed</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-800 p-4">
                <div className="text-3xl font-bold text-indigo-400">3+</div>
                <div className="text-sm text-slate-400">Research Projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white">Featured Research</h2>
            <p className="text-slate-400 mt-2">Key projects in biomedical imaging and computational diagnostics</p>
          </div>
          <Link href="/research" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            View all →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/research/${project.slug}`}
              className="group bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/30 transition-all duration-300"
            >
              {project.cover_image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={project.cover_image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3">{project.research_problem}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Publications */}
      {publications.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/50">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white">Recent Publications</h2>
              <p className="text-slate-400 mt-2">Peer-reviewed papers and manuscripts</p>
            </div>
            <Link href="/publications" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {publications.map((pub: any) => (
              <div key={pub.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 hover:border-indigo-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    pub.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    pub.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {pub.status.charAt(0).toUpperCase() + pub.status.slice(1)}
                  </span>
                  <span className="text-sm text-slate-500">{pub.year}</span>
                  {pub.journal && <span className="text-sm text-slate-500">· {pub.journal}</span>}
                </div>
                <h3 className="text-lg font-semibold text-white">{pub.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{pub.authors}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Research Notes */}
      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/50">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white">Research Notes</h2>
              <p className="text-slate-400 mt-2">Technical observations and experimental insights</p>
            </div>
            <Link href="/blog" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-slate-900/50 rounded-2xl border border-slate-800 p-6 hover:border-emerald-500/30 transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 text-xs text-slate-500">
                  {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-indigo-950/40 to-violet-950/40 rounded-2xl border border-indigo-500/20 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Interested in Collaboration?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            I am always open to discussing research collaborations, particularly in biomedical imaging, 
            optical diagnostics, and AI-driven medical applications.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
              Get in Touch
            </Link>
            <Link href="/publications" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 transition-colors">
              View Publications
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
