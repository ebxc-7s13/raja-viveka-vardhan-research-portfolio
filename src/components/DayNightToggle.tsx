'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── FLOATING CLOUD ───────────────────────────────────────────
function FloatingCloud({ delay, top, size, speed }: { delay: number; top: number; size: number; speed: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${top}%`,
        left: `-${size + 20}px`,
        animation: `cloudDrift ${speed}s linear ${delay}s infinite`,
      }}
    >
      <svg width={size} height={size * 0.5} viewBox="0 0 120 60" fill="none">
        <ellipse cx="60" cy="40" rx="50" ry="18" fill="white" opacity="0.6" />
        <ellipse cx="40" cy="30" rx="30" ry="20" fill="white" opacity="0.7" />
        <ellipse cx="75" cy="32" rx="25" ry="16" fill="white" opacity="0.65" />
        <ellipse cx="55" cy="25" rx="20" ry="15" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}

// ─── FLOATING FLOWER ──────────────────────────────────────────
function FloatingFlower({ delay, left, bottom, type }: { delay: number; left: number; bottom: number; type: number }) {
  const colors = [
    { petal: '#FFB6C1', center: '#FFD700' },
    { petal: '#DDA0DD', center: '#FFFACD' },
    { petal: '#87CEEB', center: '#FFE4B5' },
    { petal: '#FFDAB9', center: '#FF69B4' },
    { petal: '#B0E0E6', center: '#FFD700' },
  ];
  const c = colors[type % colors.length];
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        bottom: `${bottom}%`,
        animation: `flowerSway 4s ease-in-out ${delay}s infinite alternate`,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="12"
            cy="5"
            rx="4"
            ry="6"
            fill={c.petal}
            opacity="0.85"
            transform={`rotate(${angle} 12 12)`}
          />
        ))}
        <circle cx="12" cy="12" r="3" fill={c.center} />
      </svg>
    </div>
  );
}

// ─── BUTTERFLY ────────────────────────────────────────────────
function Butterfly({ delay, startX }: { delay: number; startX: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${25 + delay * 3}%`,
        left: `${startX}%`,
        animation: `butterflyFloat 8s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg width="20" height="16" viewBox="0 0 20 16">
        <path d="M10 8 C6 0, 0 2, 4 8 C0 14, 6 16, 10 8" fill="#FFB347" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values="0 10 8;20 10 8;0 10 8;-20 10 8;0 10 8" dur="0.5s" repeatCount="indefinite" />
        </path>
        <path d="M10 8 C14 0, 20 2, 16 8 C20 14, 14 16, 10 8" fill="#FFB347" opacity="0.7">
          <animateTransform attributeName="transform" type="rotate" values="0 10 8;-20 10 8;0 10 8;20 10 8;0 10 8" dur="0.5s" repeatCount="indefinite" />
        </path>
        <circle cx="10" cy="8" r="1" fill="#8B4513" />
      </svg>
    </div>
  );
}

// ─── SUN ──────────────────────────────────────────────────────
function Sun() {
  return (
    <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none">
      <div className="w-full h-full" style={{
        background: 'radial-gradient(circle at 100% 0%, rgba(255,223,100,0.4) 0%, rgba(255,165,0,0.15) 40%, transparent 65%)',
      }} />
      <svg className="absolute top-4 right-4" width="60" height="60" viewBox="0 0 60 60" style={{ opacity: 0.9 }}>
        <circle cx="30" cy="30" r="14" fill="#FFD700" />
        <circle cx="30" cy="30" r="18" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="30"
            y1="30"
            x2={30 + Math.cos((angle * Math.PI) / 180) * 26}
            y2={30 + Math.sin((angle * Math.PI) / 180) * 26}
            stroke="#FFD700"
            strokeWidth="1.5"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
}

// ─── BIRDS ────────────────────────────────────────────────────
function Birds({ delay }: { delay: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${8 + delay * 2}%`,
        left: '-5%',
        animation: `birdFly 30s linear ${delay}s infinite`,
      }}
    >
      <svg width="40" height="16" viewBox="0 0 40 16">
        <path d="M0 8 Q8 2, 16 8" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.4" />
        <path d="M16 8 Q24 2, 32 8" fill="none" stroke="#555" strokeWidth="1.5" opacity="0.4" />
      </svg>
    </div>
  );
}

// ─── MAIN TOGGLE COMPONENT ───────────────────────────────────
// No children wrapping — just the button + nature overlay
export default function DayNightToggle() {
  const [isDay, setIsDay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('daynight');
    if (saved === 'day') {
      setIsDay(true);
      document.body.classList.add('day-mode');
    }
  }, []);

  // Track mouse position for liquid glass cursor reflection
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const mx = ((e.clientX / window.innerWidth) * 100).toFixed(1);
      const my = ((e.clientY / window.innerHeight) * 100).toFixed(1);
      document.body.style.setProperty('--mx', mx + '%');
      document.body.style.setProperty('--my', my + '%');
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const toggle = useCallback(() => {
    setIsDay((prev) => {
      const next = !prev;
      localStorage.setItem('daynight', next ? 'day' : 'night');
      if (next) {
        document.body.classList.add('day-mode');
      } else {
        document.body.classList.remove('day-mode');
      }
      return next;
    });
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        onClick={toggle}
        className="fixed top-[40px] right-6 z-[100] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: isDay ? 'rgba(255,223,100,0.25)' : 'rgba(255,255,255,0.1)',
          border: isDay ? '2px solid rgba(255,200,0,0.5)' : '2px solid rgba(255,255,255,0.2)',
          boxShadow: isDay
            ? '0 0 25px rgba(255,223,100,0.4), 0 4px 12px rgba(0,0,0,0.08)'
            : '0 0 15px rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
        }}
        aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
        title={isDay ? 'Switch to night mode' : 'Switch to day mode'}
      >
        {isDay ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* ── Day mode nature overlay — fixed, behind content ── */}
      {isDay && (
        <div
          className="fixed inset-0 overflow-hidden pointer-events-none day-nature-overlay"
          style={{ zIndex: 1 }}
        >
          {/* Sky gradient */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 30%, #E0F0FF 55%, #C8E6C9 80%, #81C784 100%)',
          }} />

          <Sun />

          {/* Clouds */}
          <FloatingCloud delay={0} top={2} size={160} speed={38} />
          <FloatingCloud delay={5} top={8} size={110} speed={50} />
          <FloatingCloud delay={10} top={4} size={130} speed={42} />
          <FloatingCloud delay={15} top={12} size={90} speed={55} />
          <FloatingCloud delay={20} top={1} size={140} speed={40} />
          <FloatingCloud delay={25} top={10} size={80} speed={60} />
          <FloatingCloud delay={30} top={6} size={120} speed={45} />
          <FloatingCloud delay={35} top={14} size={70} speed={65} />
          <FloatingCloud delay={40} top={3} size={100} speed={48} />
          <FloatingCloud delay={45} top={11} size={85} speed={57} />

          {/* Birds */}
          <Birds delay={0} />
          <Birds delay={8} />
          <Birds delay={16} />

          {/* Flowers */}
          <FloatingFlower delay={0} left={3} bottom={6} type={0} />
          <FloatingFlower delay={0.3} left={10} bottom={3} type={1} />
          <FloatingFlower delay={0.7} left={18} bottom={8} type={2} />
          <FloatingFlower delay={1.0} left={28} bottom={4} type={3} />
          <FloatingFlower delay={1.4} left={36} bottom={7} type={4} />
          <FloatingFlower delay={0.2} left={44} bottom={2} type={0} />
          <FloatingFlower delay={0.6} left={52} bottom={6} type={1} />
          <FloatingFlower delay={1.1} left={60} bottom={3} type={2} />
          <FloatingFlower delay={0.4} left={68} bottom={8} type={3} />
          <FloatingFlower delay={0.8} left={76} bottom={5} type={4} />
          <FloatingFlower delay={1.3} left={84} bottom={7} type={0} />
          <FloatingFlower delay={0.9} left={92} bottom={4} type={1} />
          <FloatingFlower delay={1.6} left={97} bottom={6} type={2} />

          {/* Butterflies */}
          <Butterfly delay={0} startX={15} />
          <Butterfly delay={2} startX={45} />
          <Butterfly delay={4} startX={70} />
          <Butterfly delay={6} startX={88} />

          {/* Grass gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20" style={{
            background: 'linear-gradient(180deg, transparent, rgba(100,180,80,0.2))',
          }} />
        </div>
      )}
    </>
  );
}
