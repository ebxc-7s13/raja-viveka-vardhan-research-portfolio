'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'HOME' },
  { href: '/research', label: 'RESEARCH' },
  { href: '/publications', label: 'PAPERS' },
  { href: '/thesis', label: 'THESES' },
  { href: '/patents', label: 'PATENTS' },
  { href: '/timeline', label: 'TIMELINE' },
  { href: '/blog', label: 'NOTES' },
  { href: '/contact', label: 'CONTACT' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-[28px] left-0 right-0 z-50 bg-black border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <span className="text-black font-mono font-bold text-xs">SV</span>
            </div>
            <span className="font-bold text-white group-hover:text-white/70 transition-colors text-sm tracking-brutal uppercase hidden sm:block">
              Siluveru
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-xs font-mono font-bold tracking-brutal transition-colors ${
                    isActive
                      ? 'text-black bg-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Admin link */}
          <div className="hidden md:block">
            <Link
              href="/admin"
              className="px-3 py-1.5 text-xs font-mono font-bold tracking-brutal text-white/40 hover:text-white border border-white/20 hover:border-white/60 transition-colors"
            >
              [ADMIN]
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="square" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeLinecap="square" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 text-xs font-mono font-bold tracking-brutal ${
                    isActive
                      ? 'text-black bg-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-xs font-mono text-white/40 hover:text-white"
            >
              [ADMIN]
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
