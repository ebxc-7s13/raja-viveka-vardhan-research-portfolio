import { getDb } from '@/lib/db';
import Image from 'next/image';
import ThesisFlow from '@/components/ThesisFlow';

export const metadata = {
  title: 'Theses | Raja Viveka Vardhan Siluveru',
  description: 'M.Tech and B.Tech thesis research in biomedical imaging, optical systems, and computational diagnostics.',
};

export default async function ThesisPage() {
  const db = getDb();
  const theses = db.prepare('SELECT * FROM theses ORDER BY sort_order ASC').all() as any[];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Academic Research
          </div>
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-6">
            Research <span className="text-cyan-400">Theses</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            M.Tech and B.Tech thesis research spanning biomedical imaging, optical instrumentation, and computational methods for disease detection.
          </p>
          </div>
        </div>
      </section>

      {/* Theses — each as an interactive node flow */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="space-y-24">
          {theses.map((thesis: any) => (
            <article key={thesis.id} className="relative">
              {/* Thesis header */}
              <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {thesis.degree}
                  </span>
                  <span className="text-sm text-slate-500 font-mono">{thesis.year}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 max-w-4xl mx-auto">
                  {thesis.title}
                </h2>
                <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {thesis.institution}
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {thesis.supervisor}
                  </span>
                </div>
              </div>

              {/* Interactive node flow */}
              <ThesisFlow thesis={thesis} />

              {/* B.Tech ECG Thesis — Results Images */}
              {thesis.id === 2 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Results & Experimental Output
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src="/theses/btech-ecg/download.png"
                          alt="ECG Signal Acquisition — Raw ECG waveform captured from the acquisition system"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-4 border-t border-white/10">
                        <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Fig. 1</p>
                        <p className="text-sm text-slate-300">Raw ECG signal waveform captured during data acquisition from cannabis-consuming and non-consuming subjects.</p>
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src="/theses/btech-ecg/corer.png"
                          alt="ECG Morphological Feature Extraction — Correlation analysis of ECG morphological features"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-4 border-t border-white/10">
                        <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Fig. 2</p>
                        <p className="text-sm text-slate-300">Morphological feature correlation matrix showing discriminative ECG features used for differentiation between subject groups.</p>
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src="/theses/btech-ecg/Screenshot 2024-03-08 095833.png"
                          alt="ML Model Training — ECG feature classification results"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-4 border-t border-white/10">
                        <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Fig. 3</p>
                        <p className="text-sm text-slate-300">Machine learning model training output showing classification performance on extracted ECG morphological features.</p>
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src="/theses/btech-ecg/Screenshot 2024-03-08 113903.png"
                          alt="Final Results — Model evaluation metrics and confusion matrix"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-4 border-t border-white/10">
                        <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Fig. 4</p>
                        <p className="text-sm text-slate-300">Final model evaluation results with accuracy metrics and confusion matrix for cannabis-consumer differentiation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
