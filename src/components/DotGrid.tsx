'use client';

import { useEffect, useRef } from 'react';

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DOT_SPACING = 36;
    const BASE_RADIUS = 1;
    const MOUSE_RADIUS = 160;
    const EXTRA_DOT_SPACING = 12;

    // Pre-calculate pulse patches — random centers that cycle brightness
    const patches: { cx: number; cy: number; radius: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 6; i++) {
      patches.push({
        cx: Math.random() * 2000,
        cy: Math.random() * 2000,
        radius: 120 + Math.random() * 160,
        speed: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      // Recalculate patch centers relative to viewport
      patches.forEach((p, i) => {
        p.cx = Math.random() * canvas!.width;
        p.cy = Math.random() * canvas!.height;
      });
    }
    resize();
    window.addEventListener('resize', resize);

    function onMouse(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    });

    function draw() {
      if (!ctx || !canvas) return;
      timeRef.current += 0.016; // ~60fps
      const t = timeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw base dot matrix
      const cols = Math.ceil(canvas.width / DOT_SPACING) + 1;
      const rows = Math.ceil(canvas.height / DOT_SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * DOT_SPACING;
          const y = r * DOT_SPACING;

          const dx = x - mx;
          const dy = y - my;
          const distMouse = Math.sqrt(dx * dx + dy * dy);

          // Pulse patches — each dot gets influenced by nearby patches
          let pulse = 0;
          for (const patch of patches) {
            const pdx = x - patch.cx;
            const pdy = y - patch.cy;
            const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pDist < patch.radius) {
              const falloff = 1 - pDist / patch.radius;
              pulse += falloff * (0.5 + 0.5 * Math.sin(t * patch.speed + patch.phase));
            }
          }
          pulse = Math.min(pulse, 1);

          let opacity = 0.07 + pulse * 0.12;
          let radius = BASE_RADIUS;

          // Mouse hover — dots grow
          if (distMouse < MOUSE_RADIUS) {
            const factor = 1 - distMouse / MOUSE_RADIUS;
            radius = BASE_RADIUS + factor * 1.5;
            opacity = Math.min(opacity + factor * 0.15, 0.35);
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
      }

      // Draw extra dots near mouse — higher density sub-grid
      if (mx > 0 && my > 0) {
        const extraCols = Math.ceil((MOUSE_RADIUS * 2) / EXTRA_DOT_SPACING) + 1;
        const extraRows = Math.ceil((MOUSE_RADIUS * 2) / EXTRA_DOT_SPACING) + 1;
        const startX = Math.floor((mx - MOUSE_RADIUS) / EXTRA_DOT_SPACING) * EXTRA_DOT_SPACING;
        const startY = Math.floor((my - MOUSE_RADIUS) / EXTRA_DOT_SPACING) * EXTRA_DOT_SPACING;

        for (let r = 0; r < extraRows; r++) {
          for (let c = 0; c < extraCols; c++) {
            const x = startX + c * EXTRA_DOT_SPACING;
            const y = startY + r * EXTRA_DOT_SPACING;

            const dx = x - mx;
            const dy = y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
              const factor = 1 - dist / MOUSE_RADIUS;
              const extraRadius = 0.6 + factor * 1.0;
              const extraOpacity = factor * 0.18;

              ctx.beginPath();
              ctx.arc(x, y, extraRadius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${extraOpacity})`;
              ctx.fill();
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
