import { getDb } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import ImageCrossFade from '@/components/ImageCrossFade';
import GlassTitle from '@/components/GlassTitle';

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
    <main className="min-h-screen bg-black">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-white/20">
        {/* Grid lines background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Corner marks */}
        <div className="absolute top-6 left-6 text-white/20 font-mono text-xs">[001]</div>
        <div className="absolute top-6 right-6 text-white/20 font-mono text-xs">SYS.ONLINE</div>
        <div className="absolute bottom-6 left-6 text-white/20 font-mono text-xs">◆ BIOMEDICAL ENGINEERING</div>
        <div className="absolute bottom-6 right-6 text-white/20 font-mono text-xs">IIEST SHIBPUR</div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/30 text-white text-[10px] font-mono font-bold tracking-brutal uppercase mb-8">
                <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                RESEARCHER // 001
              </div>

              {/* Name */}
              <h1 className="mb-6">
                <span className="block text-white">Siluveru</span>
                <span className="block text-white/40">Raja Viveka Vardhan</span>
              </h1>

              {/* White divider line */}
              <div className="w-full h-[2px] bg-white mb-6" />

              <p className="text-white/50 leading-relaxed mb-8 max-w-lg font-mono text-sm">
                Developing label-free imaging systems and computational methods
                for early disease detection — optical imaging, AI/ML, non-invasive diagnostics.
              </p>

              {/* Research areas */}
              <div className="flex flex-wrap gap-2 mb-10">
                {['IMAGING', 'DEEP LEARNING', 'CANCER DETECTION', 'INSTRUMENTATION', 'DIAGNOSTICS'].map((area) => (
                  <span key={area} className="px-3 py-1 text-[10px] font-mono font-bold tracking-brutal uppercase border border-white/30 text-white/70">
                    {area}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/research"
                  className="px-6 py-3 bg-white text-black text-xs font-mono font-bold tracking-brutal uppercase hover:bg-white/80 transition-colors"
                >
                  [EXPLORE RESEARCH →]
                </Link>
                <Link
                  href="/publications"
                  className="px-6 py-3 border border-white/30 text-white text-xs font-mono font-bold tracking-brutal uppercase hover:border-white/60 transition-colors"
                >
                  [PUBLICATIONS]
                </Link>
                <Link
                  href="/thesis"
                  className="px-6 py-3 border border-white/30 text-white text-xs font-mono font-bold tracking-brutal uppercase hover:border-white/60 transition-colors"
                >
                  [THESIS]
                </Link>
              </div>
            </div>

            {/* Hero Image Grid */}
            <div className="relative hidden lg:flex items-center justify-center">
              <ImageCrossFade />
              {/* Floating stats */}
              <div className="absolute -bottom-6 -left-6 bg-black border border-white/30 p-3">
                <div className="text-2xl font-bold text-white font-mono">2+</div>
                <div className="text-[10px] text-white/40 font-mono uppercase tracking-brutal">Theses</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white p-3">
                <div className="text-2xl font-bold text-black font-mono">3+</div>
                <div className="text-[10px] text-black/60 font-mono uppercase tracking-brutal">Projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED RESEARCH ═══ */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-[10px] font-mono text-white/30 tracking-brutal uppercase mb-2">[002]</div>
            <GlassTitle><h2 className="text-white">Featured Research</h2></GlassTitle>
            <div className="w-16 h-[2px] bg-white mt-4" />
          </div>
          <Link href="/research" className="text-white/40 hover:text-white text-xs font-mono font-bold tracking-brutal uppercase">
            [VIEW ALL →]
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/research/${project.slug}`}
              className="group border border-white/10 hover:border-white/40 transition-all"
            >
              {project.cover_image && (
                <div className="relative h-48 overflow-hidden border-b border-white/10">
                  <Image
                    src={project.cover_image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-white/70 transition-colors uppercase tracking-tight">
                  {project.title}
                </h3>
                <p className="text-xs text-white/40 font-mono line-clamp-3">{project.research_problem}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ PUBLICATIONS ═══ */}
      {publications.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[10px] font-mono text-white/30 tracking-brutal uppercase mb-2">[003]</div>
              <GlassTitle><h2 className="text-white">Publications</h2></GlassTitle>
              <div className="w-16 h-[2px] bg-white mt-4" />
            </div>
            <Link href="/publications" className="text-white/40 hover:text-white text-xs font-mono font-bold tracking-brutal uppercase">
              [VIEW ALL →]
            </Link>
          </div>

          <div className="space-y-0">
            {publications.map((pub: any) => (
              <div key={pub.id} className="border border-white/10 p-6 hover:border-white/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-brutal border ${
                    pub.status === 'published' ? 'border-white text-white' :
                    pub.status === 'accepted' ? 'border-white/60 text-white/60' :
                    'border-white/30 text-white/30'
                  }`}>
                    {pub.status}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">{pub.year}</span>
                  {pub.journal && <span className="text-[10px] text-white/30 font-mono">— {pub.journal}</span>}
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">{pub.title}</h3>
                <p className="text-xs text-white/30 font-mono mt-1">{pub.authors}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ RESEARCH NOTES ═══ */}
      {posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[10px] font-mono text-white/30 tracking-brutal uppercase mb-2">[004]</div>
              <GlassTitle><h2 className="text-white">Research Notes</h2></GlassTitle>
              <div className="w-16 h-[2px] bg-white mt-4" />
            </div>
            <Link href="/blog" className="text-white/40 hover:text-white text-xs font-mono font-bold tracking-brutal uppercase">
              [VIEW ALL →]
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group border border-white/10 p-6 hover:border-white/40 transition-all"
              >
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-white/70 transition-colors uppercase tracking-tight">
                  {post.title}
                </h3>
                <p className="text-xs text-white/40 font-mono line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 text-[10px] text-white/20 font-mono uppercase tracking-brutal">
                  {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ CTA ═══ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="border border-white/20 p-12 text-center relative">
          {/* Corner marks */}
          <div className="absolute top-3 left-3 text-white/20 font-mono text-[10px]">◆</div>
          <div className="absolute top-3 right-3 text-white/20 font-mono text-[10px]">◆</div>
          <div className="absolute bottom-3 left-3 text-white/20 font-mono text-[10px]">◆</div>
          <div className="absolute bottom-3 right-3 text-white/20 font-mono text-[10px]">◆</div>

          <GlassTitle><h2 className="text-white mb-4">Collaboration</h2></GlassTitle>
          <div className="w-16 h-[2px] bg-white mx-auto mb-6" />
          <p className="text-white/40 mb-8 max-w-2xl mx-auto font-mono text-sm">
            Open to research collaborations in biomedical imaging,
            optical diagnostics, and AI-driven medical applications.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="px-6 py-3 bg-white text-black text-xs font-mono font-bold tracking-brutal uppercase hover:bg-white/80 transition-colors">
              [GET IN TOUCH →]
            </Link>
            <Link href="/publications" className="px-6 py-3 border border-white/30 text-white text-xs font-mono font-bold tracking-brutal uppercase hover:border-white/60 transition-colors">
              [PUBLICATIONS]
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
