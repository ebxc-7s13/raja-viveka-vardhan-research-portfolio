'use client';

const MARQUEE_TEXT =
  '◆ BIOMEDICAL ENGINEERING ◆ ORAL CANCER DETECTION ◆ AUTOFLORESCENCE IMAGING ◆ DEEP LEARNING ◆ LABEL-FREE DIAGNOSTICS ◆ OPTICAL IMAGING ◆ NON-INVASIVE DIAGNOSTICS ◆ COMPUTATIONAL PATHOLOGY ◆ MICROGRAVITY SIMULATION ◆ FASCANET ◆ AFIS-NET ◆ ';

interface MarqueeProps {
  direction?: 'left' | 'right';
}

export default function Marquee({ direction = 'left' }: MarqueeProps) {
  const text = MARQUEE_TEXT.repeat(3);
  const animClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

  return (
    <div className="relative w-full overflow-hidden bg-white py-1.5 select-none z-50">
      <div className={`flex whitespace-nowrap ${animClass}`}>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0">
          {text}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0">
          {text}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0">
          {text}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase shrink-0">
          {text}
        </span>
      </div>
    </div>
  );
}
