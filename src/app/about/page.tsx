import { getDb } from '@/lib/db';
import Image from 'next/image';

export const metadata = {
  title: 'About | Raja Viveka Vardhan Siluveru — Biomedical Engineering Researcher',
  description: 'Academic background, research interests, and technical expertise of Raja Viveka Vardhan Siluveru in biomedical imaging, optical systems, and AI-driven diagnostics.',
};

export default async function AboutPage() {
  const db = getDb();
  // Get research themes from DB
  const themes = db.prepare('SELECT * FROM research_themes ORDER BY sort_order ASC').all() as any[];

  // Hardcoded skills organized by category (based on actual CV and documents)
  const skillGroups: Record<string, { name: string; proficiency: number }[]> = {
    'Research Methods': [
      { name: 'Experimental Design', proficiency: 95 },
      { name: 'Image Acquisition', proficiency: 95 },
      { name: 'Signal Processing', proficiency: 90 },
      { name: 'Statistical Analysis', proficiency: 85 },
      { name: 'Literature Review', proficiency: 90 },
    ],
    'Imaging & Instrumentation': [
      { name: 'Confocal Microscopy (Leica STELLARIS 5)', proficiency: 95 },
      { name: 'Multispectral Imaging', proficiency: 90 },
      { name: 'Autofluorescence Imaging', proficiency: 95 },
      { name: 'LED-based Microscopy', proficiency: 90 },
      { name: 'Microgravity Simulation Systems', proficiency: 90 },
    ],
    'AI / Computational Methods': [
      { name: 'Deep Learning (PyTorch)', proficiency: 90 },
      { name: 'Computer Vision (OpenCV)', proficiency: 90 },
      { name: 'Wavelet Analysis', proficiency: 85 },
      { name: 'GANs (StyleGAN2-ADA)', proficiency: 85 },
      { name: 'Transformer Architectures (SwinV2)', proficiency: 85 },
      { name: 'Transfer Learning', proficiency: 90 },
    ],
    'Hardware / Prototyping': [
      { name: 'Raspberry Pi (3, 4, 5)', proficiency: 90 },
      { name: 'Stepper Motor Control (TMC2209)', proficiency: 85 },
      { name: 'IoT Systems', proficiency: 85 },
      { name: 'Sensor Integration', proficiency: 80 },
      { name: 'LED Optics Design', proficiency: 80 },
    ],
    'Software': [
      { name: 'Python', proficiency: 95 },
      { name: 'MATLAB', proficiency: 90 },
      { name: 'PyTorch', proficiency: 90 },
      { name: 'ROS 2 (Jazzy)', proficiency: 80 },
      { name: 'Git', proficiency: 85 },
      { name: 'LaTeX', proficiency: 85 },
    ],
  };

  const categoryIcons: Record<string, string> = {
    'Research Methods': '🔬',
    'Imaging & Instrumentation': '🔭',
    'AI / Computational Methods': '🤖',
    'Hardware / Prototyping': '⚡',
    'Software': '💻',
  };

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                About the Researcher
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                <span className="text-indigo-400">Siluveru</span>
                <br />
                Raja Viveka Vardhan
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-6">
                Biomedical Engineering Researcher working at the intersection of optical imaging, 
                AI/ML, and non-invasive diagnostics. M.Tech Gold Medallist at IIEST Shibpur 
                with a focus on label-free oral cancer detection using multispectral imaging 
                and deep learning.
              </p>
              <p className="text-slate-400 leading-relaxed">
                My research addresses the critical need for accessible, non-invasive diagnostic 
                tools — particularly for resource-limited settings where conventional biopsy-based 
                methods are impractical. I develop complete experimental systems from hardware 
                instrumentation through computational analysis.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                <Image
                  src="/research/microscope/Screenshot 2026-08-21 170928.png"
                  alt="Multispectral imaging system"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border-4 border-slate-950">
                <span className="text-3xl">🔬</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Background */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white mb-12">Academic Background</h2>
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">M.Tech — Biomedical Engineering</h3>
                <p className="text-indigo-400 font-medium">IIEST Shibpur, Centre for Healthcare Science and Technology</p>
                <p className="text-slate-500 text-sm mt-1">2024 – 2026 · CGPA: 10/10 · University Gold Medallist</p>
                <p className="text-slate-400 mt-3 leading-relaxed">
                  Thesis: &quot;A Non-Invasive AI-Based Framework for Early Oral Cancer Detection 
                  Using Autofluorescence Imaging&quot; — Developing a unified AFI pipeline with 
                  FASCANet denoising, StyleGAN2 synthetic augmentation, and AFiS-Net classification.
                </p>
                <p className="text-slate-500 text-sm mt-2">Supervisor: Dr. Ananya Barui</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">B.Tech — Biomedical Engineering</h3>
                <p className="text-emerald-400 font-medium">NIT Rourkela, Dept. of Biotechnology &amp; Medical Engineering</p>
                <p className="text-slate-500 text-sm mt-1">2018 – 2022 · CGPA: 8.55/10</p>
                <p className="text-slate-400 mt-3 leading-relaxed">
                  Thesis: &quot;Differentiating Cannabis-Consuming Population from Non-Consumers 
                  using ECG Morphological Features through Machine Learning Models&quot;
                </p>
                <p className="text-slate-500 text-sm mt-2">Supervisor: Dr. J. Sivaraman</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Themes */}
      {themes.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/50">
          <h2 className="text-3xl font-bold text-white mb-12">Research Themes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme: any) => (
              <div key={theme.id} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 hover:border-indigo-500/30 transition-colors">
                <div className="text-3xl mb-3">{theme.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{theme.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{theme.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Expertise */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/50">
        <h2 className="text-3xl font-bold text-white mb-12">Technical Expertise</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(skillGroups).map(([category, categorySkills]) => (
            <div key={category} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>{categoryIcons[category] || '📋'}</span>
                {category}
              </h3>
              <div className="space-y-3">
                {categorySkills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{skill.name}</span>
                      <span className="text-slate-500">{skill.proficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research Philosophy */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/50">
        <div className="bg-gradient-to-br from-indigo-950/30 to-violet-950/30 rounded-2xl border border-indigo-500/20 p-12 text-center">
          <svg className="w-12 h-12 text-indigo-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <blockquote className="text-xl md:text-2xl text-slate-300 italic leading-relaxed max-w-3xl mx-auto mb-6">
            &quot;I believe the most impactful research develops complete systems — from the physical 
            measurement instrument through the computational pipeline to the clinical decision. 
            My work aims to bridge the gap between laboratory research and deployable diagnostic tools, 
            particularly for communities that need them most.&quot;
          </blockquote>
          <p className="text-indigo-400 font-medium">— Research Philosophy</p>
        </div>
      </section>
    </main>
  );
}
