'use client';

import { useState, useEffect, useCallback } from 'react';

const WALLPAPERS = [
  '/wallpapers/blossom-1.jfif',
  '/wallpapers/blossom-2.jfif',
  '/wallpapers/blossom-3.jfif',
  '/wallpapers/blossom-4.jfif',
  '/wallpapers/blossom-5.jfif',
  '/wallpapers/blossom-6.jfif',
  '/wallpapers/blossom-7.jfif',
];

const CROSSFADE_DURATION = 5000;
const DISPLAY_DURATION = 14000;

export default function BlossomTheme() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const advance = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % WALLPAPERS.length);
      setNextIndex((prev) => (prev + 1) % WALLPAPERS.length);
      setIsTransitioning(false);
    }, CROSSFADE_DURATION);
  }, []);

  useEffect(() => {
    const interval = setInterval(advance, DISPLAY_DURATION);
    return () => clearInterval(interval);
  }, [advance]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none blossom-theme-bg"
      style={{ zIndex: 0 }}
    >
      {/* Current wallpaper (fading out) */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transitionDuration: `${CROSSFADE_DURATION}ms`,
          transitionTimingFunction: 'ease-in-out',
        }}
      >
        <img
          src={WALLPAPERS[currentIndex]}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'blur(3px) brightness(0.55) saturate(1.1)' }}
        />
      </div>

      {/* Next wallpaper (fading in) */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transitionDuration: `${CROSSFADE_DURATION}ms`,
          transitionTimingFunction: 'ease-in-out',
        }}
      >
        <img
          src={WALLPAPERS[nextIndex]}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'blur(3px) brightness(0.55) saturate(1.1)' }}
        />
      </div>

      {/* Soft pink overlay for cohesion */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,182,193,0.15) 0%, rgba(0,0,0,0.1) 50%, rgba(255,182,193,0.1) 100%)',
        }}
      />

      {/* Vignette — dark edges for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 0%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Vintage warm tint at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 55% 50% at 50% 50%, transparent 0%, rgba(120,60,20,0.18) 100%)',
        }}
      />
    </div>
  );
}
