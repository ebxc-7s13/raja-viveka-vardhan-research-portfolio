'use client';

const MARQUEE_TEXT =
  '◆ BIOMEDICAL ENGINEERING ◆ ORAL CANCER DETECTION ◆ AUTOFLORESCENCE IMAGING ◆ DEEP LEARNING ◆ LABEL-FREE DIAGNOSTICS ◆ OPTICAL IMAGING ◆ NON-INVASIVE DIAGNOSTICS ◆ COMPUTATIONAL PATHOLOGY ◆ MICROGRAVITY SIMULATION ◆ FASCANET ◆ AFIS-NET ◆ ';

interface MarqueeProps {
  direction?: 'left' | 'right';
}

export default function Marquee({ direction = 'left' }: MarqueeProps) {
  const text = MARQUEE_TEXT.repeat(4);
  const isLeft = direction === 'left';

  return (
    <div
      className="relative w-full overflow-hidden bg-white py-1.5 select-none z-50"
      style={{ contain: 'layout' }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          width: 'max-content',
          animation: `${isLeft ? 'marqueeLeft' : 'marqueeRight'} 35s linear infinite`,
        }}
      >
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0 pr-4">
          {text}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0 pr-4">
          {text}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0 pr-4">
          {text}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0 pr-4">
          {text}
        </span>
      </div>
    </div>
  );
}
