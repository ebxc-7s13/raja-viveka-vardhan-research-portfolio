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

interface TrailPoint {
  x: number;
  y: number;
  life: number; // 1 = fresh, 0 = dead
}

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const patchesRef = useRef<Patch[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const lastTrailRef = useRef(0);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DOT_SPACING = 30;
    const BASE_RADIUS = 1.2;
    const MOUSE_RADIUS = 140;
    const EXTRA_DOT_SPACING = 14;
    const SHAPES: Patch['shape'][] = ['circle', 'rect', 'diamond'];
    let mouseMoved = false;
    let lastMouseMove = 0;

    function makePatches() {
      const w = canvas!.width || 2000;
      const h = canvas!.height || 2000;
      const patches: Patch[] = [];
      for (let i = 0; i < 15; i++) {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        patches.push({
          cx: Math.random() * w,
          cy: Math.random() * h,
          radius: 60 + Math.random() * 120,
          speed: 0.3 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          shape,
          w: 80 + Math.random() * 160,
          h: 60 + Math.random() * 140,
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
      mouseMoved = true;
      lastMouseMove = performance.now();

      // Add trail point every 32ms (~30fps) — reduced from 16ms
      const now = performance.now();
      if (now - lastTrailRef.current > 32) {
        lastTrailRef.current = now;
        trailRef.current.push({ x: e.clientX, y: e.clientY, life: 1 });
        if (trailRef.current.length > 40) {
          trailRef.current.shift();
        }
      }
    }
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    });

    function draw() {
      if (!ctx || !canvas) return;

      const now = performance.now();
      const timeSinceMouse = now - lastMouseMove;

      // Throttle: skip frames when mouse idle > 200ms and no trail to render
      const hasTrail = trailRef.current.length > 0;
      if (!mouseMoved && !hasTrail && timeSinceMouse > 200) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

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

          let opacity = 0.05 + pulse * 0.15;
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

      // === MOUSE TRAIL (LINE) — green in night, cyan in day ===
      const isDayMode = document.body.classList.contains('day-mode');
      const trailR = isDayMode ? 0 : 57;
      const trailG = isDayMode ? 220 : 255;
      const trailB = isDayMode ? 255 : 20;
      const trail = trailRef.current;
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.025;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1];
          const b = trail[i];
          const alpha = b.life * 0.8;
          const width = 1 + b.life * 3;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${trailR}, ${trailG}, ${trailB}, ${alpha * 0.3})`;
          ctx.lineWidth = width + 6;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${trailR}, ${trailG}, ${trailB}, ${alpha})`;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      mouseMoved = false;
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
      className="fixed inset-0 pointer-events-none z-[3]"
      aria-hidden="true"
    />
  );
}
