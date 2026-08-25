'use client';

const TEXT =
  '◆ BIOMEDICAL ENGINEERING ◆ ORAL CANCER DETECTION ◆ AUTOFLORESCENCE IMAGING ◆ DEEP LEARNING ◆ LABEL-FREE DIAGNOSTICS ◆ OPTICAL IMAGING ◆ NON-INVASIVE DIAGNOSTICS ◆ COMPUTATIONAL PATHOLOGY ◆ MICROGRAVITY SIMULATION ◆ FASCANET ◆ AFIS-NET ◆';

interface MarqueeProps {
  direction?: 'left' | 'right';
}

export default function Marquee({ direction = 'left' }: MarqueeProps) {
  const half = TEXT.repeat(6);

  // One word ≈ 20 chars, ~12px per char at 11px font = ~240px per word
  // 300ms per word → 240px / 0.3s = 800px/s
  // -50% of ~14400px = -7200px → 7200/800 = 9s for one cycle
  // Speed: 9s for -50%, so we use 9s duration
  const animName = direction === 'left' ? 'scrollLeft' : 'scrollRight';

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'white',
        paddingTop: '6px',
        paddingBottom: '6px',
        zIndex: 50,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: `${animName} 9s linear infinite`,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'black',
            textTransform: 'uppercase',
          }}
        >
          {half}&nbsp;&nbsp;&nbsp;{half}
        </span>
      </div>
    </div>
  );
}
