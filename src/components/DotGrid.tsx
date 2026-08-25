'use client';

import { useEffect, useRef } from 'react';

interface Patch {
  cx: number;
  cy: number;
  radius: number;
  speed: number;
  phase: number;
  shape: 'circle' | 'rect' | 'diamond';
  w: number;
  h: number;
}

function distToShape(
  x: number, y: number,
  patch: Patch
): number {
  const dx = x - patch.cx;
  const dy = y - patch.cy;

  switch (patch.shape) {
    case 'circle':
      return Math.sqrt(dx * dx + dy * dy);
    case 'rect': {
      const rx = patch.w / 2;
      const ry = patch.h / 2;
      const closestX = Math.max(-rx, Math.min(dx, rx));
      const closestY = Math.max(-ry, Math.min(dy, ry));
      return Math.sqrt((dx - closestX) ** 2 + (dy - closestY) ** 2);
    }
    case 'diamond': {
      const a = patch.w / 2;
      const b = patch.h / 2;
      return (Math.abs(dx) / a + Math.abs(dy) / b) * ((a + b) / 2);
    }
  }
}

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const patchesRef = useRef<Patch[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DOT_SPACING = 36;
    const BASE_RADIUS = 1;
    const MOUSE_RADIUS = 160;
    const EXTRA_DOT_SPACING = 12;
    const SHAPES: Patch['shape'][] = ['circle', 'rect', 'diamond'];

    function makePatches() {
      const w = canvas!.width || 2000;
      const h = canvas!.height || 2000;
      const patches: Patch[] = [];
      for (let i = 0; i < 10; i++) {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        patches.push({
          cx: Math.random() * w,
          cy: Math.random() * h,
          radius: 80 + Math.random() * 200,
          speed: 0.2 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          shape,
          w: 100 + Math.random() * 250,
          h: 80 + Math.random() * 200,
        });
      }
      return patches;
    }

    patchesRef.current = makePatches();

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      patchesRef.current = makePatches();
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
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const patches = patchesRef.current;

      // Base dot matrix
      const cols = Math.ceil(canvas.width / DOT_SPACING) + 1;
      const rows = Math.ceil(canvas.height / DOT_SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * DOT_SPACING;
          const y = r * DOT_SPACING;

          // Sum pulse influence from all patches
          let pulse = 0;
          for (const patch of patches) {
            const d = distToShape(x, y, patch);
            if (d < patch.radius) {
              const falloff = 1 - d / patch.radius;
              pulse += falloff * falloff * (0.5 + 0.5 * Math.sin(t * patch.speed + patch.phase));
            }
          }
          pulse = Math.min(pulse, 1);

          let opacity = 0.04 + pulse * 0.16;
          let radius = BASE_RADIUS;

          // Mouse hover
          const dx = x - mx;
          const dy = y - my;
          const distMouse = Math.sqrt(dx * dx + dy * dy);
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

      // Extra dots near mouse
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
              ctx.beginPath();
              ctx.arc(x, y, 0.6 + factor * 1.0, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${factor * 0.18})`;
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
