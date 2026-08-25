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
  '/research/microscope/Screenshot%202026-08-21%20170928.png',
  '/research/microscope/Screenshot%202026-08-21%20170945.png',
  '/research/microscope/Screenshot%202026-08-21%20171003.png',
  '/research/microscope/Screenshot%202026-08-21%20171027.png',
  '/research/microscope/Screenshot%202026-08-21%20171103.png',
  '/research/microscope/Screenshot%202026-08-21%20171118.png',
  '/research/microscope/Screenshot%202026-08-21%20171153.png',
  '/research/microscope/Screenshot%202026-08-21%20171214.png',
  '/research/microscope/Screenshot_2026-08-08_133944.png',
  '/research/microscope/Screenshot_2026-08-08_134716.png',
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
const FADE_DURATION = 1800; // ms for crossfade
const SWAP_INTERVAL = 2800; // ms between swaps

function shuffleArray(arr: string[]): string[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickNineUnique(): string[] {
  const shuffled = shuffleArray(ALL_IMAGES);
  return shuffled.slice(0, GRID_SIZE);
}

export default function ImageCrossFade() {
  const [images, setImages] = useState<string[]>(() => pickNineUnique());
  const [fadingIndex, setFadingIndex] = useState<number | null>(null);
  const [nextImage, setNextImage] = useState<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedImagesRef = useRef<Set<string>>(new Set(ALL_IMAGES));

  const pickNewImage = useCallback(() => {
    // Get images currently displayed
    const currentSet = new Set(images);
    // Available = all minus currently shown
    const available = ALL_IMAGES.filter((img) => !currentSet.has(img));
    if (available.length === 0) return ALL_IMAGES[Math.floor(Math.random() * ALL_IMAGES.length)];
    return available[Math.floor(Math.random() * available.length)];
  }, [images]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const idx = Math.floor(Math.random() * GRID_SIZE);
      const newImg = pickNewImage();

      setFadingIndex(idx);
      setNextImage(newImg);

      // After fade completes, swap the image and clear fading state
      setTimeout(() => {
        setImages((prev) => {
          const next = [...prev];
          next[idx] = newImg;
          return next;
        });
        setFadingIndex(null);
        setNextImage('');
      }, FADE_DURATION);
    }, SWAP_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pickNewImage]);

  return (
    <div className="grid grid-cols-3 gap-2 aspect-square w-full max-w-md rounded-2xl overflow-hidden border border-slate-800">
      {images.map((src, i) => {
        const isFading = fadingIndex === i;
        return (
          <div
            key={`${i}-${src}`}
            className="relative overflow-hidden bg-slate-900"
          >
            {/* Current image */}
            <Image
              src={src}
              alt={`Research image ${i + 1}`}
              fill
              className={`object-cover transition-opacity duration-[1800ms] ease-in-out ${
                isFading ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="(max-width: 768px) 33vw, 160px"
              unoptimized
            />
            {/* Incoming image */}
            {isFading && nextImage && (
              <Image
                src={nextImage}
                alt={`Research image ${i + 1}`}
                fill
                className="object-cover absolute inset-0 animate-fadeIn"
                sizes="(max-width: 768px) 33vw, 160px"
                unoptimized
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
