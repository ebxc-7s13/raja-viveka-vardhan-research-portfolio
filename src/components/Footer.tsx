import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white flex items-center justify-center">
                <span className="text-black font-mono font-bold text-xs">SV</span>
              </div>
              <span className="font-bold text-white text-sm tracking-brutal uppercase">
                Siluveru Raja Viveka Vardhan
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-md font-mono">
              Biomedical Engineering Researcher. Label-free imaging, computational methods,
              early disease detection.
            </p>
          </div>

          {/* Research */}
          <div>
            <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-brutal mb-4">
              [ RESEARCH ]
            </h3>
            <ul className="space-y-2">
              <li><Link href="/research" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ Projects</Link></li>
              <li><Link href="/publications" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ Publications</Link></li>
              <li><Link href="/thesis" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ Theses</Link></li>
              <li><Link href="/patents" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ Patents</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-brutal mb-4">
              [ CONNECT ]
            </h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ About</Link></li>
              <li><Link href="/timeline" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ Timeline</Link></li>
              <li><Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ Notes</Link></li>
              <li><Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors font-mono">→ Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30 font-mono uppercase tracking-brutal">
            © 2026 Siluveru R. V. — All rights reserved
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono">Privacy</Link>
            <span className="text-white/20">|</span>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
