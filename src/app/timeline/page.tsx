import { getDb } from '@/lib/db';
import TimelineClient from '@/components/TimelineClient';

export const metadata = {
  title: 'Research Timeline | Raja Viveka Vardhan Siluveru',
  description: 'Academic and research milestones — degrees, publications, prototypes, and key achievements in biomedical engineering research.',
};

export default async function TimelinePage() {
  const db = getDb();
  const timeline = db.prepare('SELECT * FROM timeline ORDER BY date ASC, sort_order ASC').all() as any[];
  const publications = db.prepare("SELECT * FROM publications WHERE status IN ('published', 'accepted') ORDER BY year DESC").all() as any[];

  const milestones = [
    ...timeline.map((t: any) => ({
      year: t.date,
      title: t.title,
      description: t.description,
      category: t.category,
      icon: t.icon,
    })),
    ...publications.map((p: any) => ({
      year: String(p.year),
      title: `Publication: ${p.title}`,
      description: `Published in ${p.journal}`,
      category: 'publication',
      icon: '📄',
    })),
  ].sort((a: any, b: any) => a.year.localeCompare(b.year));

  const categoryColors: Record<string, string> = {
    education: 'bg-blue-500',
    research: 'bg-emerald-500',
    publication: 'bg-indigo-500',
    patent: 'bg-amber-500',
    award: 'bg-rose-500',
    project: 'bg-cyan-500',
    startup: 'bg-violet-500',
  };

  const categoryLabels: Record<string, string> = {
    education: 'Education',
    research: 'Research',
    publication: 'Publication',
    patent: 'Patent',
    award: 'Achievement',
    project: 'Project',
    startup: 'Startup',
  };

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Research Journey
          </div>
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-6">
            Research <span className="text-violet-400">Timeline</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            A chronological view of academic milestones, research achievements, publications, and technological innovations.
          </p>
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 text-sm text-slate-400">
              <span className={`w-3 h-3 rounded-full ${categoryColors[key]}`} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <TimelineClient
          milestones={milestones}
          categoryColors={categoryColors}
          categoryLabels={categoryLabels}
        />
      </section>
    </main>
  );
}
