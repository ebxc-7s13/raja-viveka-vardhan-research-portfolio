'use client';

import { useEffect, useRef, useState } from 'react';

interface Milestone {
  year: string;
  title: string;
  description: string;
  category: string;
  icon: string;
}

interface TimelineClientProps {
  milestones: Milestone[];
  categoryColors: Record<string, string>;
  categoryLabels: Record<string, string>;
}

const categoryGlows: Record<string, string> = {
  education: 'shadow-blue-500/20',
  research: 'shadow-emerald-500/20',
  publication: 'shadow-indigo-500/20',
  patent: 'shadow-amber-500/20',
  award: 'shadow-rose-500/20',
  project: 'shadow-cyan-500/20',
  startup: 'shadow-violet-500/20',
};

const categoryBorders: Record<string, string> = {
  education: 'hover:border-blue-500/40',
  research: 'hover:border-emerald-500/40',
  publication: 'hover:border-indigo-500/40',
  patent: 'hover:border-amber-500/40',
  award: 'hover:border-rose-500/40',
  project: 'hover:border-cyan-500/40',
  startup: 'hover:border-violet-500/40',
};

const categoryAccents: Record<string, string> = {
  education: 'bg-blue-500',
  research: 'bg-emerald-500',
  publication: 'bg-indigo-500',
  patent: 'bg-amber-500',
  award: 'bg-rose-500',
  project: 'bg-cyan-500',
  startup: 'bg-violet-500',
};

export default function TimelineClient({
  milestones,
  categoryColors,
  categoryLabels,
}: TimelineClientProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress for the vertical line
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      const scrolled = windowHeight / 2 - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Group by year
  const grouped: Record<string, Milestone[]> = {};
  milestones.forEach((m) => {
    if (!grouped[m.year]) grouped[m.year] = [];
    grouped[m.year].push(m);
  });
  const years = Object.keys(grouped).sort();

  return (
    <div ref={timelineRef} className="relative">
      {/* Animated vertical line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-800">
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-violet-500 via-violet-400 to-cyan-500 transition-all duration-100"
          style={{ height: `${scrollProgress * 100}%` }}
        />
        {/* Glowing dot at the progress head */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-violet-400 shadow-lg shadow-violet-500/50 transition-all duration-100"
          style={{ top: `${scrollProgress * 100}%` }}
        >
          <div className="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-30" />
        </div>
      </div>

      {years.map((year, yearIdx) => {
        let globalIdx = 0;
        for (let i = 0; i < yearIdx; i++) {
          globalIdx += grouped[years[i]].length;
        }

        return (
          <div key={year} className="mb-16 last:mb-0">
            {/* Year marker */}
            <ScrollReveal delay={0}>
              <div className="relative flex items-center mb-8">
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                  <YearMarker year={year} />
                </div>
              </div>
            </ScrollReveal>

            {/* Events for this year */}
            <div className="space-y-6 ml-20 md:ml-0">
              {grouped[year].map((event, idx) => {
                const isLeft = (yearIdx + idx) % 2 === 0;
                return (
                  <ScrollReveal
                    key={idx}
                    direction={isLeft ? 'left' : 'right'}
                    delay={idx * 0.1}
                  >
                    <div
                      className={`md:flex ${
                        isLeft ? 'md:justify-start' : 'md:justify-end'
                      }`}
                    >
                      <div className={`md:w-5/12 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                        <EventCard
                          event={event}
                          categoryColors={categoryColors}
                          categoryLabels={categoryLabels}
                        />
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Scroll-triggered reveal wrapper ─── */
function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    up: 'translate-y-8',
    left: '-translate-x-12',
    right: 'translate-x-12',
  };

  return (
    <div
      ref={ref}
      className="transition-all ease-out"
      style={{
        transitionDuration: '700ms',
        transitionDelay: `${delay * 1000}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0, 0)' : undefined,
      }}
    >
      <div
        className="transition-all ease-out"
        style={{
          transitionDuration: '700ms',
          transitionDelay: `${delay * 1000}ms`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : undefined,
          ...(visible
            ? {}
            : direction === 'left'
            ? { transform: 'translateX(-3rem)' }
            : direction === 'right'
            ? { transform: 'translateX(3rem)' }
            : { transform: 'translateY(2rem)' }),
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Animated year marker ─── */
function YearMarker({ year }: { year: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-500"
      style={{
        transform: visible ? 'scale(1)' : 'scale(0.5)',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center relative group">
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-700"
          style={{
            boxShadow: visible
              ? '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)'
              : 'none',
          }}
        />
        <span className="text-xs font-bold text-white font-mono">{year}</span>
      </div>
    </div>
  );
}

/* ─── Event card with hover effects ─── */
function EventCard({
  event,
  categoryColors,
  categoryLabels,
}: {
  event: Milestone;
  categoryColors: Record<string, string>;
  categoryLabels: Record<string, string>;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`
          bg-slate-900/50 rounded-xl border border-slate-800 p-5 
          transition-all duration-300 cursor-default
          ${categoryBorders[event.category] || 'hover:border-slate-700'}
          hover:shadow-lg ${categoryGlows[event.category] || ''}
          hover:bg-slate-900/80
        `}
      >
        {/* Accent line at top */}
        <div
          className={`absolute top-0 left-0 h-0.5 rounded-t-xl transition-all duration-500 ${
            categoryAccents[event.category] || 'bg-slate-500'
          }`}
          style={{ width: hovered ? '100%' : '0%' }}
        />

        <div className="flex items-center gap-2 mb-2">
          <span
            className={`w-2 h-2 rounded-full ${categoryColors[event.category] || 'bg-slate-500'} transition-all duration-300`}
            style={{
              boxShadow: hovered
                ? `0 0 8px ${hovered ? 'currentColor' : 'transparent'}`
                : 'none',
            }}
          />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {categoryLabels[event.category] || event.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-1 transition-colors duration-300 group-hover:text-violet-300">
          {event.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
}
