'use client';

const TEXT =
  ' ◆ BIOMEDICAL ENGINEERING ◆ ORAL CANCER DETECTION ◆ AUTOFLORESCENCE IMAGING ◆ DEEP LEARNING ◆ LABEL-FREE DIAGNOSTICS ◆ OPTICAL IMAGING ◆ NON-INVASIVE DIAGNOSTICS ◆ COMPUTATIONAL PATHOLOGY ◆ MICROGRAVITY SIMULATION ◆ FASCANET ◆ AFIS-NET ◆';

interface MarqueeProps {
  direction?: 'left' | 'right';
  sticky?: boolean;
}

export default function Marquee({ direction = 'left', sticky = false }: MarqueeProps) {
  const half = TEXT.repeat(6);
  const animName = direction === 'left' ? 'scrollLeft' : 'scrollRight';

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'white',
        paddingTop: '2px',
        paddingBottom: '2px',
        zIndex: 51,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? '0' : undefined,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: `${animName} 30s linear infinite`,
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
