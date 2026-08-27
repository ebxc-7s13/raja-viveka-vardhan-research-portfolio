'use client';

import { useState, useEffect, useCallback } from 'react';

const MAX_STARS = 3;

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

let nextId = 0;

function makeStar(): Star {
  return {
    id: nextId++,
    x: 5 + Math.random() * 90,
    y: 3 + Math.random() * 85,
    size: 1.5 + Math.random() * 2,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 3,
  };
}

export default function NightStars() {
  const [stars, setStars] = useState<Star[]>(() => {
    // Start with 2-3 stars already twinkling
    const count = 2 + Math.floor(Math.random() * 2);
    return Array.from({ length: count }, makeStar);
  });

  const replaceStar = useCallback((id: number) => {
    setStars((prev) => prev.map((s) => (s.id === id ? makeStar() : s)));
  }, []);

  useEffect(() => {
    // Periodically replace a random star to keep 2-3 active
    const interval = setInterval(() => {
      setStars((prev) => {
        if (prev.length < MAX_STARS) {
          return [...prev, makeStar()];
        }
        // Replace a random one
        const idx = Math.floor(Math.random() * prev.length);
        const updated = [...prev];
        updated[idx] = makeStar();
        return updated;
      });
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 2 }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5), 0 0 ${star.size * 4}px rgba(200, 220, 255, 0.2)`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
