import { getDb } from '@/lib/db';

export const metadata = {
  title: 'Patents & Technology | Raja Viveka Vardhan Siluveru',
  description: 'Research innovations, patent-pending technologies, and novel engineering systems developed through biomedical and optical engineering research.',
};

export default async function PatentsPage() {
  const db = getDb();
  const patents = db.prepare('SELECT * FROM patents ORDER BY sort_order ASC').all() as any[];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Patents & Technology
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Research <span className="text-amber-400">Innovations</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Novel technologies and engineering systems developed through interdisciplinary research in biomedical imaging, optical systems, and computational diagnostics.
          </p>
          </div>
        </div>
      </section>

      {/* Patents */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {patents.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Patent Portfolio</h3>
            <p className="text-slate-500">Technology disclosures and patent applications will be listed here as they are filed.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {patents.map((patent: any) => (
              <article key={patent.id} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    patent.status === 'granted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    patent.status === 'search_report' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {patent.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  {patent.research_area && (
                    <span className="text-xs text-slate-500">{patent.research_area}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{patent.title}</h3>
                <div className="text-slate-400 mb-6 leading-relaxed whitespace-pre-line text-[15px]">{patent.description}</div>
                {patent.innovation && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-amber-400 mb-2">Innovation & Technical Contribution</h4>
                    <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{patent.innovation}</div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{patent.inventors}</span>
                  <span className="text-slate-700">|</span>
                  <span>{patent.applicant}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Technology Transfer Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8">Technology Development</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 rounded-2xl border border-indigo-500/20 p-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Label-Free Oral Cancer Detection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Portable multispectral imaging system with embedded AI classification for non-invasive screening of oral potentially malignant disorders. Designed for point-of-care deployment in resource-limited settings.
              </p>
              <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Prototype Developed
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 rounded-2xl border border-emerald-500/20 p-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Microgravity Measurement System</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                High-precision spring-based microgravity measurement apparatus with CCD-based displacement detection, designed for geophysical subsurface anomaly detection in mining applications.
              </p>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Prototype &amp; Methodology Published
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 rounded-2xl border border-rose-500/20 p-8">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">USB Microscope Imaging Pipeline</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automated image acquisition, preprocessing, and classification pipeline for USB microscope-based oral tissue analysis. Includes stain normalization and artifact removal.
              </p>
              <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Research Tool Deployed
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 rounded-2xl border border-amber-500/20 p-8">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Coal Volume Detection via Microgravity</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Computational framework for estimating coal seam volume distribution using microgravity anomaly data inversion, with numerical modeling of gravitational response.
              </p>
              <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Methodology Published
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
