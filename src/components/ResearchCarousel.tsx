'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Theme {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export default function ResearchCarousel({ themes }: { themes: Theme[] }) {
  const [activeIndex, setActiveIndex] = useState(Math.floor(themes.length / 2));
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate every 4s
  useEffect(() => {
    autoRotateRef.current = setInterval(() => {
      if (!isDragging) {
        setActiveIndex((prev) => (prev + 1) % themes.length);
      }
    }, 4000);
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [isDragging, themes.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + themes.length) % themes.length);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % themes.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [themes.length]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const diff = e.clientX - startX;
      setDragOffset(diff);
    },
    [isDragging, startX]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60;
    if (dragOffset < -threshold) {
      setActiveIndex((prev) => (prev + 1) % themes.length);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => (prev - 1 + themes.length) % themes.length);
    }
    setDragOffset(0);
  }, [isDragging, dragOffset, themes.length]);

  function getSlideStyle(index: number) {
    const total = themes.length;
    // Calculate shortest distance from active
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    // Apply drag offset as fractional shift
    const dragShift = isDragging ? dragOffset / 200 : 0;
    const effectiveOffset = offset + dragShift;

    const absOffset = Math.abs(effectiveOffset);

    // More dramatic scale: center=1.15, adjacent=0.7, outer=0.45
    const scale = Math.max(0.4, 1.15 - absOffset * 0.28);

    // Wider horizontal spread
    const translateX = effectiveOffset * 280;

    // Deeper Z for more 3D depth
    const translateZ = -absOffset * 180;

    // Stronger Y rotation for 3D tilt
    const rotateY = effectiveOffset * -12;

    // Aggressive opacity falloff
    const opacity = Math.max(0.25, 1 - absOffset * 0.35);

    // More blur on distant cards
    const blur = absOffset > 1 ? Math.min((absOffset - 1) * 2, 4) : 0;

    // Z-index: center on top
    const zIndex = 10 - Math.round(absOffset);

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full py-12 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ perspective: '1500px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 3D carousel track */}
      <div className="relative flex items-center justify-center h-[380px]">
        {themes.map((theme, index) => {
          const style = getSlideStyle(index);
          const isActive = index === activeIndex;

          return (
            <div
              key={theme.id}
              className="absolute w-[360px]"
              style={style}
              onClick={() => {
                if (!isDragging) setActiveIndex(index);
              }}
            >
              <div
                data-day-card
                className={`
                  rounded-2xl border p-6 transition-all duration-500
                  ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900/80 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.2),0_12px_40px_rgba(0,0,0,0.5)]'
                      : 'bg-slate-900/60 border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-500
                    ${
                      isActive
                        ? 'bg-indigo-500/20 scale-125 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        : 'bg-slate-800/50 scale-100'
                    }
                  `}
                >
                  <span className="text-3xl">{theme.icon}</span>
                </div>

                {/* Title */}
                <h3
                  className={`
                    font-bold mb-3 leading-snug transition-colors duration-500
                    ${isActive ? 'text-white text-xl' : 'text-slate-300 text-base'}
                  `}
                >
                  {theme.title}
                </h3>

                {/* Description — only fully visible when active */}
                <p
                  className={`
                    text-sm leading-relaxed transition-all duration-500
                    ${isActive ? 'text-slate-400 max-h-40 opacity-100' : 'text-slate-500 max-h-12 opacity-70'}
                  `}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: isActive ? undefined : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {theme.description}
                </p>

                {/* Active indicator bar */}
                <div
                  className={`
                    h-0.5 rounded-full mt-4 transition-all duration-500
                    ${isActive ? 'bg-gradient-to-r from-indigo-500 to-violet-500 w-full' : 'bg-slate-700 w-8'}
                  `}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {themes.map((_, index) => (
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
            aria-label={`Go to theme ${index + 1}`}
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
