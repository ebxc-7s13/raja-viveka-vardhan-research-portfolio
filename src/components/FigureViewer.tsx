'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface FigureViewerProps {
  src: string;
  alt: string;
  captionTitle?: string | null;
  caption?: string | null;
}

export default function FigureViewer({ src, alt, captionTitle, caption }: FigureViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* Inline figure */}
      <div
        className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer hover:border-slate-600 transition-colors group"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setIsOpen(true); }}
      >
        <div className="relative w-full">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
          />
        </div>
        {/* Click to enlarge indicator */}
        <div className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Click to enlarge
        </div>
      </div>
      {/* Caption */}
      {(captionTitle || caption) && (
        <figcaption className="mt-2">
          {captionTitle && (
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">{captionTitle}</p>
          )}
          {caption && (
            <p className="text-xs text-slate-500 leading-relaxed italic">{caption}</p>
          )}
        </figcaption>
      )}

      {/* Lightbox overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 md:top-0 md:-right-12 text-white/70 hover:text-white z-10 p-2"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Image */}
            <div className="relative w-full">
              <Image
                src={src}
                alt={alt}
                width={2400}
                height={1600}
                className="w-full h-auto object-contain rounded-lg"
                priority
                sizes="100vw"
              />
            </div>
            {/* Caption in lightbox */}
            {(captionTitle || caption) && (
              <div className="mt-4 text-center max-w-3xl">
                {captionTitle && (
                  <p className="text-sm font-semibold text-white/90">{captionTitle}</p>
                )}
                {caption && (
                  <p className="text-sm text-white/60 mt-1 italic">{caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
