import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SR</span>
              </div>
              <span className="font-semibold text-white">Raja Viveka Vardhan Siluveru</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Biomedical Engineering Researcher working at the intersection of optical imaging, 
              AI/ML, and non-invasive diagnostics. Developing label-free computational methods 
              for early disease detection.
            </p>
          </div>

          {/* Research */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Research</h3>
            <ul className="space-y-2">
              <li><Link href="/research" className="text-sm text-slate-400 hover:text-white transition-colors">Projects</Link></li>
              <li><Link href="/publications" className="text-sm text-slate-400 hover:text-white transition-colors">Publications</Link></li>
              <li><Link href="/thesis" className="text-sm text-slate-400 hover:text-white transition-colors">Theses</Link></li>
              <li><Link href="/patents" className="text-sm text-slate-400 hover:text-white transition-colors">Patents & Technology</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="/timeline" className="text-sm text-slate-400 hover:text-white transition-colors">Timeline</Link></li>
              <li><Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">Research Notes</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Raja Viveka Vardhan Siluveru. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
