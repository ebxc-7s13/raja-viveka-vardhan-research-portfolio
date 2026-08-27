'use client';

import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 30;
const LERP_FACTOR = 0.35;

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export default function CursorTrail({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const smoothRef = useRef({ x: -100, y: -100 });
  const mouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const colorRef = useRef(color);

  // Keep colorRef in sync
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const draw = () => {
      const { x: mx, y: my } = mouseRef.current;
      const s = smoothRef.current;

      // Lerp toward mouse for smooth following
      s.x += (mx - s.x) * LERP_FACTOR;
      s.y += (my - s.y) * LERP_FACTOR;

      // Add smoothed point
      pointsRef.current.unshift({ x: s.x, y: s.y });
      if (pointsRef.current.length > TRAIL_LENGTH) {
        pointsRef.current.pop();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pts = pointsRef.current;
      if (pts.length < 2) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const { r, g, b } = hexToRgb(colorRef.current);

      // Draw glow layer
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        const t = i / pts.length;
        const lineWidth = 18 * (1 - t * 0.8);
        const opacity = (1 - t) * 0.15;

        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 2})`;
        ctx.shadowBlur = 20;
        ctx.stroke();
      }
      ctx.restore();

      // Draw main trail stroke
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        const t = i / pts.length;
        const lineWidth = 6 * (1 - t * 0.7);
        const opacity = (1 - t) * 0.85;

        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
      ctx.restore();

      // Draw leading dot
      if (pts.length > 0) {
        const head = pts[0];
        ctx.beginPath();
        ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 99999 }}
    />
  );
}
