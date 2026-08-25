'use client';

const TEXT =
  ' ◆ BIOMEDICAL ENGINEERING ◆ ORAL CANCER DETECTION ◆ AUTOFLORESCENCE IMAGING ◆ DEEP LEARNING ◆ LABEL-FREE DIAGNOSTICS ◆ OPTICAL IMAGING ◆ NON-INVASIVE DIAGNOSTICS ◆ COMPUTATIONAL PATHOLOGY ◆ MICROGRAVITY SIMULATION ◆ FASCANET ◆ AFIS-NET ◆';

interface MarqueeProps {
  direction?: 'left' | 'right';
}

export default function Marquee({ direction = 'left' }: MarqueeProps) {
  // Two identical halves — animation translates by -50% for seamless loop
  const half = TEXT.repeat(8);

  return (
    <div
      className="w-full bg-white py-1.5 z-50 select-none"
      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
    >
      <div
        style={{
          display: 'inline-flex',
          animation: `marqueeScroll 45s linear infinite${direction === 'right' ? ' reverse' : ''}`,
        }}
      >
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase">
          {half}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase">
          {half}
        </span>
      </div>
    </div>
  );
}
