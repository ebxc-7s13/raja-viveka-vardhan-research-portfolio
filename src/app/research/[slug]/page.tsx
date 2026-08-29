import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDb } from '@/lib/db';
import FigureViewer from '@/components/FigureViewer';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as any;
}

async function getMedia(projectId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM project_media WHERE project_id = ? ORDER BY sort_order ASC').all(projectId) as any[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.title} | Research`,
    description: project.research_problem,
    openGraph: {
      title: project.title,
      description: project.research_problem.substring(0, 200),
      type: 'article',
      images: project.cover_image ? [project.cover_image] : [],
    },
  };
}

const sectionConfig: Record<string, { title: string; num: number; color: string; description?: string }> = {
  research_problem: { title: 'Research Problem', num: 1, color: 'red' },
  motivation: { title: 'Motivation', num: 2, color: 'orange' },
  approach: { title: 'Approach', num: 3, color: 'amber' },
  methodology: { title: 'Methodology', num: 4, color: 'yellow' },
  experimental_setup: { title: 'Experimental Setup', num: 5, color: 'emerald' },
  hardware: { title: 'Hardware & Instrumentation', num: 6, color: 'teal' },
  data_acquisition: { title: 'Data Acquisition', num: 7, color: 'cyan' },
  computational_method: { title: 'Computational Method', num: 8, color: 'blue' },
  results: { title: 'Results', num: 9, color: 'violet' },
  key_contribution: { title: 'Key Contribution', num: 10, color: 'purple' },
};

const colorClasses: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  red:    { border: 'border-l-red-500',    bg: 'bg-red-500/10',    text: 'text-red-400',    badge: 'bg-red-500/15 text-red-400 border-red-500/20' },
  orange: { border: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  amber:  { border: 'border-l-amber-500',  bg: 'bg-amber-500/10',  text: 'text-amber-400',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  yellow: { border: 'border-l-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  emerald:{ border: 'border-l-emerald-500',bg: 'bg-emerald-500/10',text: 'text-emerald-400',badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  teal:   { border: 'border-l-teal-500',   bg: 'bg-teal-500/10',   text: 'text-teal-400',   badge: 'bg-teal-500/15 text-teal-400 border-teal-500/20' },
  cyan:   { border: 'border-l-cyan-500',   bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  blue:   { border: 'border-l-blue-500',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  violet: { border: 'border-l-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  purple: { border: 'border-l-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
};

function MediaSection({ media, section }: { media: any[]; section: string }) {
  const items = media.filter((m: any) => m.section === section);
  if (items.length === 0) return null;

  return (
    <div className="mt-6 grid grid-cols-1 gap-4">
      {items.map((item: any) => (
        <figure key={item.id} className="group">
          {item.media_type === 'image' ? (
            <FigureViewer
              src={item.file_path}
              alt={item.caption || item.caption_title || ''}
              captionTitle={item.caption_title}
              caption={item.caption}
            />
          ) : item.media_type === 'video' ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
              <video
                controls
                preload="none"
                className="w-full rounded-lg"
                poster=""
              >
                <source src={item.file_path} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

export default async function ResearchProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const media = await getMedia(project.id);

  // Get section keys that have content
  const activeSections = Object.entries(sectionConfig)
    .filter(([key]) => project[key])
    .map(([key, config]) => ({ key, ...config }));

  // Section order for media lookup
  const sectionKeys = ['experimental_setup', 'hardware', 'data_acquisition', 'computational_method', 'results', 'methodology', 'research_problem', 'motivation', 'approach', 'key_contribution'];

  return (
    <main className="min-h-screen bg-slate-950">
      <article className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/research" className="hover:text-indigo-400 transition-colors">Research</Link>
          <span>/</span>
          <span className="text-slate-300 truncate">{project.title}</span>
        </nav>

        {/* Cover Image */}
        {project.cover_image && (
          <div className="mb-10 rounded-xl overflow-hidden border border-slate-800 relative aspect-[16/7]">
            <Image
              src={project.cover_image}
              alt={project.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              project.status === 'ongoing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              project.status === 'under_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }`}>
              {String(project.status).replace(/_/g, ' ')}
            </span>
            {project.featured ? (
              <span className="text-xs text-amber-400 font-medium px-2 py-1 bg-amber-500/10 rounded-full">Featured</span>
            ) : null}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {project.title}
          </h1>
        </header>

        {/* Table of Contents */}
        <nav className="mb-12 p-6 bg-slate-900/50 rounded-xl border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Contents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {activeSections.map(({ key, title, num }) => {
              const colors = colorClasses[sectionConfig[key].color] || colorClasses.blue;
              return (
                <a
                  key={key}
                  href={`#section-${key}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${colors.text} hover:bg-slate-800 transition-colors`}
                >
                  <span className={`w-5 h-5 ${colors.bg} rounded flex items-center justify-center text-[10px] font-bold`}>{num}</span>
                  <span className="truncate">{title}</span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* Case Study Sections */}
        <div className="space-y-16">
          {activeSections.map(({ key, title, num, color }) => {
            const value = project[key];
            const colors = colorClasses[color] || colorClasses.blue;
            const sectionMedia = media.filter((m: any) => m.section === key);

            return (
              <section key={key} id={`section-${key}`} className={`border-l-2 ${colors.border} pl-6 md:pl-8 scroll-mt-24`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`w-9 h-9 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center text-sm font-bold shrink-0`}>
                    {num}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
                </div>

                <div className="prose prose-invert prose-slate max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-[15px]">{value}</p>
                </div>

                {/* Media for this section */}
                {sectionMedia.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 gap-4">
                    {sectionMedia.map((item: any) => (
                      <figure key={item.id} className="group">
                        {item.media_type === 'image' ? (
                          <FigureViewer
                            src={item.file_path}
                            alt={item.caption || item.caption_title || `${title} - figure`}
                            captionTitle={item.caption_title}
                            caption={item.caption}
                          />
                        ) : item.media_type === 'video' ? (
                          <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                            <video
                              controls
                              preload="none"
                              className="w-full"
                            >
                              <source src={item.file_path} />
                            </video>
                          </div>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Related Links */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-wrap gap-3">
          <Link href="/publications" className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-colors text-sm font-medium">
            Publications
          </Link>
          <Link href="/research" className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
            All Projects
          </Link>
          <Link href="/thesis" className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
            Theses
          </Link>
        </div>
      </article>
    </main>
  );
}
