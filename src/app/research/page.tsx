import { getDb } from '@/lib/db';
import Link from 'next/link';
import ProjectCarousel from '@/components/ProjectCarousel';

export const metadata = {
  title: 'Research Projects | Raja Viveka Vardhan Siluveru',
  description: 'Research projects in biomedical imaging, AI diagnostics, microgravity simulation, and medical instrumentation — presented as complete case studies.',
};

export default async function ResearchPage() {
  const db = getDb();

  const projects = db.prepare('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, created_at DESC').all() as any[];

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

      {/* Projects — 3D Carousel */}
      <section className="py-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <p className="text-slate-500 text-sm text-center font-mono">Drag or use ← → arrow keys to explore</p>
        </div>
        <ProjectCarousel
          projects={projects.map((p: any) => ({
            ...p,
            media_count: countMap.get(p.id) || 0,
          }))}
        />
      </section>
    </main>
  );
}
