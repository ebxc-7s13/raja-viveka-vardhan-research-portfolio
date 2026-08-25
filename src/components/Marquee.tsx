'use client';

const TEXT =
  '◆ BIOMEDICAL ENGINEERING ◆ ORAL CANCER DETECTION ◆ AUTOFLORESCENCE IMAGING ◆ DEEP LEARNING ◆ LABEL-FREE DIAGNOSTICS ◆ OPTICAL IMAGING ◆ NON-INVASIVE DIAGNOSTICS ◆ COMPUTATIONAL PATHOLOGY ◆ MICROGRAVITY SIMULATION ◆ FASCANET ◆ AFIS-NET ◆ ';

interface MarqueeProps {
  direction?: 'left' | 'right';
}

export default function Marquee({ direction = 'left' }: MarqueeProps) {
  const content = TEXT.repeat(6);
  const isLeft = direction === 'left';

  return (
    <div className="w-full overflow-hidden bg-white py-1.5 z-50 select-none" style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          width: 'fit-content',
          animation: `marquee-scroll ${isLeft ? 'normal' : 'reverse'} 40s linear infinite`,
        }}
      >
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase whitespace-nowrap">
          {content}
        </span>
        <span className="text-[11px] font-mono font-bold tracking-brutal text-black uppercase whitespace-nowrap">
          {content}
        </span>
      </div>
    </div>
  );
}
