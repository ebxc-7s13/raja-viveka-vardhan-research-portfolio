'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const ALL_IMAGES = [
  '/research/coal-volume/scan_map.png',
  '/research/coal-volume/session_20260801_220024.png',
  '/research/microgravity/WhatsApp%20Image%202026-05-15%20at%2010.04.52.jpeg',
  '/research/microscope/20260702_11h59m25s_grim.png',
  '/research/microscope/20260702_12h02m03s_grim.png',
  '/research/microscope/20260702_12h53m03s_grim.png',
  '/research/microscope/led-excitation-wavelengths.png',
  '/research/microscope/oral-cancer-statistics.png',
  '/research/microscope/sample-collection-workflow.png',
  '/research/microscope/afi-cell-images.png',
  '/research/microscope/fascanet-architecture.png',
  '/research/microscope/denoising-results.png',
  '/research/microscope/denoising-metrics-table.png',
  '/research/microscope/redox-ratio-preservation.png',
  '/research/microscope/edge-segmentation-brightfield.png',
  '/research/microscope/edge-fluorescence-analysis.png',
  '/research/microscope/raspi/blue%20capturing.png',
  '/research/microscope/raspi/breightfeild%20iamging.png',
  '/research/microscope/raspi/cancer%20cell.png',
  '/research/microscope/raspi/denosing%20on%20edge%20wiht%20modl%20inference.png',
  '/research/microscope/raspi/denosing.png',
  '/research/microscope/raspi/green%20capturing.png',
  '/research/microscope/raspi/live%20roi%20capturing.png',
  '/research/microscope/raspi/noraml%20cell.png',
  '/research/microscope/raspi/ommon%20ROI%20capturing%20for%20all%20colors%20.png',
  '/research/microscope/raspi/red%20ccacpturing.png',
  '/research/microscope/raspi/segmentaion%20on%20edge.png',
  '/research/microscope/raspi/smoker%20cell.png',
  '/research/oral-cancer/fig5b_screening_progression.png',
  '/research/oral-cancer/fig6_workflow_overview.png',
  '/research/oral-cancer/greenimsgingsoft.png',
  '/research/oral-cancer/model.png',
  '/research/oral-cancer/noiseanalysis.png',
  '/research/oral-cancer/rawcolorrep.png',
  '/research/oral-cancer/redoox.png',
  '/research/oral-cancer/segmentingsoft.png',
];

const GRID_SIZE = 9;
const FADE_DURATION = 1800;
const SWAP_INTERVAL = 3000;

const INITIAL_IMAGES = ALL_IMAGES.slice(0, GRID_SIZE);

function shuffleArray(arr: string[]): string[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface CellState {
  current: string;
  incoming: string | null;
  fading: boolean;
}

function initCells(imgs: string[]): CellState[] {
  return imgs.map((src) => ({ current: src, incoming: null, fading: false }));
}

export default function ImageCrossFade() {
  const [cells, setCells] = useState<CellState[]>(() => initCells(INITIAL_IMAGES));
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCells(initCells(shuffleArray(ALL_IMAGES).slice(0, GRID_SIZE)));
    setMounted(true);
  }, []);

  const pickNewImage = useCallback((currentImages: string[]) => {
    const currentSet = new Set(currentImages);
    const available = ALL_IMAGES.filter((img) => !currentSet.has(img));
    if (available.length === 0)
      return ALL_IMAGES[Math.floor(Math.random() * ALL_IMAGES.length)];
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  useEffect(() => {
    if (!mounted) return;

    intervalRef.current = setInterval(() => {
      setCells((prev) => {
        const candidates = prev
          .map((c, i) => ({ c, i }))
          .filter(({ c }) => !c.fading);
        if (candidates.length === 0) return prev;

        const { i: idx } = candidates[Math.floor(Math.random() * candidates.length)];
        const currentImages = prev.map((c) => c.current);
        const newImg = pickNewImage(currentImages);

        const next = [...prev];
        next[idx] = { ...next[idx], incoming: newImg, fading: true };

        setTimeout(() => {
          setCells((inner) => {
            const updated = [...inner];
            updated[idx] = { current: newImg, incoming: null, fading: false };
            return updated;
          });
        }, FADE_DURATION);

        return next;
      });
    }, SWAP_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mounted, pickNewImage]);

  return (
    <div className="grid grid-cols-3 gap-2 w-full rounded-2xl overflow-hidden border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.08)]" style={{ maxWidth: '624px', aspectRatio: '4 / 3' }}>
      {cells.map((cell, i) => (
        <div
          key={`cell-${i}`}
          className="relative overflow-hidden bg-white/5"
        >
          {/* Current image — stays fully visible */}
          <Image
            src={cell.current}
            alt={`Research image ${i + 1}`}
            fill
            className="object-cover opacity-100"
            sizes="(max-width: 768px) 33vw, 180px"
            unoptimized
          />
          {/* Incoming image — fades IN on top, current is never hidden */}
          {cell.fading && cell.incoming && (
            <Image
              src={cell.incoming}
              alt={`Research image ${i + 1}`}
              fill
              className="object-cover absolute inset-0"
              style={{
                opacity: 0,
                animation: `crossfadeIn ${FADE_DURATION}ms ease-in-out forwards`,
              }}
              sizes="(max-width: 768px) 33vw, 180px"
              unoptimized
            />
          )}
        </div>
      ))}
    </div>
  );
}
