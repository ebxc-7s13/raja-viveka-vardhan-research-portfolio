'use client';

const MARQUEE_TEXT =
  '◆ BIOMEDICAL ENGINEERING ◆ ORAL CANCER DETECTION ◆ AUTOFLORESCENCE IMAGING ◆ DEEP LEARNING ◆ LABEL-FREE DIAGNOSTICS ◆ OPTICAL IMAGING ◆ NON-INVASIVE DIAGNOSTICS ◆ COMPUTATIONAL PATHOLOGY ◆ MICROGRAVITY SIMULATION ◆ FASCANET ◆ AFIS-NET ◆ ';

interface MarqueeProps {
  direction?: 'left' | 'right';
}

export default function Marquee({ direction = 'left' }: MarqueeProps) {
  const repeatedText = MARQUEE_TEXT.repeat(4);
  const animationDir = direction === 'left' ? 'marqueeLeft' : 'marqueeRight';

  return (
    <div className="relative w-full overflow-hidden bg-white py-1.5 select-none z-50">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `${animationDir} 40s linear infinite`,
        }}
      >
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase px-2">
          {repeatedText}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase px-2">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
