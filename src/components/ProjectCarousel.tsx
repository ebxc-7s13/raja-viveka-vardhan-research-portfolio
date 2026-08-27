'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  id: number;
  slug: string;
  title: string;
  status: string;
  featured: boolean | number;
  research_problem?: string;
  results?: string;
  cover_image?: string;
  media_count?: number;
}

export default function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(Math.floor(projects.length / 2));
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate every 5s
  useEffect(() => {
    autoRotateRef.current = setInterval(() => {
      if (!isDragging) {
        setActiveIndex((prev) => (prev + 1) % projects.length);
      }
    }, 5000);
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [isDragging, projects.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % projects.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [projects.length]);  // Detect touch device for lower threshold
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    // Prevent text selection on touch
    if (e.pointerType === 'touch') {
      e.preventDefault();
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setDragOffset(diff);
    // Prevent vertical scroll while swiping horizontally on touch
    if (e.pointerType === 'touch' && Math.abs(diff) > 10) {
      e.preventDefault();
    }
  }, [isDragging, startX]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = isTouch ? 30 : 60;
    if (dragOffset < -threshold) {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
    }
    setDragOffset(0);
  }, [isDragging, dragOffset, projects.length, isTouch]);

  function getSlideStyle(index: number) {
    const total = projects.length;
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const dragShift = isDragging ? dragOffset / 200 : 0;
    const effectiveOffset = offset + dragShift;
    const absOffset = Math.abs(effectiveOffset);

    // Dramatic scale differences
    const scale = Math.max(0.4, 1.15 - absOffset * 0.28);
    const translateX = effectiveOffset * 300;
    const translateZ = -absOffset * 180;
    const rotateY = effectiveOffset * -12;
    const opacity = Math.max(0.25, 1 - absOffset * 0.35);
    const blur = absOffset > 1 ? Math.min((absOffset - 1) * 2, 4) : 0;
    const zIndex = 10 - Math.round(absOffset);

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'ongoing': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'under_review': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default: return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full py-8 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ perspective: '1500px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 3D carousel track */}
      <div className="relative flex items-center justify-center h-[420px]">
        {projects.map((project, index) => {
          const style = getSlideStyle(index);
          const isActive = index === activeIndex;

          return (
            <div
              key={project.id}
              className="absolute w-[420px]"
              style={style}
              onClick={() => {
                if (!isDragging) setActiveIndex(index);
              }}
            >
              <Link
                href={`/research/${project.slug}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  data-day-card
                  className={`
                    rounded-2xl border overflow-hidden transition-all duration-500
                    ${
                      isActive
                        ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.2),0_16px_48px_rgba(0,0,0,0.5)]'
                        : 'bg-slate-900/60 border-slate-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
                    }
                  `}
                >
                  {/* Cover Image */}
                  {project.cover_image && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={project.cover_image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        loading="lazy"
                        sizes="420px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Status + Featured */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                        {project.status.replace(/_/g, ' ')}
                      </span>
                      {project.featured ? (
                        <span className="text-xs text-amber-400 font-medium">★ Featured</span>
                      ) : null}
                      {project.media_count && project.media_count > 0 && (
                        <span className="text-xs text-slate-500">{project.media_count} media</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`
                      font-bold mb-3 leading-snug transition-colors duration-500
                      ${isActive ? 'text-white text-lg' : 'text-slate-300 text-base'}
                    `}>
                      {project.title}
                    </h3>

                    {/* Problem → Results preview */}
                    {(project.research_problem || project.results) && (
                      <div className="flex flex-col gap-2 mb-3">
                        {project.research_problem && (
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Problem</p>
                            <p className="text-sm text-slate-400 line-clamp-2">{project.research_problem}</p>
                          </div>
                        )}
                        {project.results && (
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Key Result</p>
                            <p className="text-sm text-slate-400 line-clamp-2">{project.results}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <span className="text-sm text-indigo-400 font-medium inline-flex items-center gap-1">
                      View case study
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>

                    {/* Active indicator bar */}
                    <div className={`
                      h-0.5 rounded-full mt-4 transition-all duration-500
                      ${isActive ? 'bg-gradient-to-r from-indigo-500 to-violet-500 w-full' : 'bg-slate-700 w-8'}
                    `} />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(index);
            }}
            className={`
              rounded-full transition-all duration-300
              ${
                index === activeIndex
                  ? 'w-8 h-2 bg-indigo-500'
                  : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'
              }
            `}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>

      {/* Drag hint */}
      <p className="text-center text-[10px] text-slate-600 mt-3 font-mono uppercase tracking-wider">
        ← Drag or use arrow keys →
      </p>
    </div>
  );
}
