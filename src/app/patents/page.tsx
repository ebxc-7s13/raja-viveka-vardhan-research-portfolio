import { getDb } from '@/lib/db';
import GlassTitle from '@/components/GlassTitle';

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
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Intellectual Property
            </div>
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-6">
              Patents & <span className="text-amber-400">Innovations</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Novel technologies and engineering systems developed through interdisciplinary research — patent-pending intellectual property.
            </p>
          </div>
        </div>
      </section>

      {/* Patents as IP Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {patents.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <svg className="w-16 h-16 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Patent Portfolio</h3>
            <p className="text-slate-500">Technology disclosures and patent applications will be listed here as they are filed.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {patents.map((patent: any, idx: number) => (
              <article
                key={patent.id}
                className="group relative bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/40 transition-all duration-300"
              >
                {/* Top accent bar */}
                <div className={`h-1 w-full ${idx === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`} />

                <div className="p-8">
                  {/* Header: Shield icon + Status */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                        <svg className={`w-6 h-6 ${idx === 0 ? 'text-blue-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        patent.status === 'granted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        patent.status === 'search_report' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {patent.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 font-mono">IP-{String(idx + 1).padStart(3, '0')}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-4 leading-tight">{patent.title}</h3>

                  {/* One-line description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{patent.description}</p>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Inventors</div>
                      <div className="text-sm text-slate-300 font-medium">{patent.inventors}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Applicant</div>
                      <div className="text-sm text-slate-300 font-medium">{patent.applicant}</div>
                    </div>
                  </div>

                  {/* Innovation highlights */}
                  {patent.innovation && (
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Key Innovation</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{patent.innovation}</p>
                    </div>
                  )}

                  {/* Research area tag */}
                  {patent.research_area && (
                    <div className="mt-4 flex items-center gap-2">
                      {patent.research_area.split(',').map((area: string, i: number) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          {area.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Confidentiality Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-500 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Detailed methodology and technical specifications are protected under pending patent applications
          </div>
        </div>

        {/* Technology Development Cards */}
        <div className="mt-16">
          <GlassTitle><h2 className="text-3xl font-bold text-white mb-8">Technology Development</h2></GlassTitle>
          <div className="grid md:grid-cols-2 gap-6">
            <div data-day-card className="bg-gradient-to-br from-indigo-950/40 to-slate-900 rounded-2xl border border-indigo-500/20 p-8">
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

            <div data-day-card className="bg-gradient-to-br from-emerald-950/40 to-slate-900 rounded-2xl border border-emerald-500/20 p-8">
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

            <div data-day-card className="bg-gradient-to-br from-rose-950/40 to-slate-900 rounded-2xl border border-rose-500/20 p-8">
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

            <div data-day-card className="bg-gradient-to-br from-amber-950/40 to-slate-900 rounded-2xl border border-amber-500/20 p-8">
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
