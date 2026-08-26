'use client';

import { useEffect, useState } from 'react';

interface GlassTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Simple frosted glass highlight behind short section titles.
 * Only visible in day mode — plain text in night mode.
 */
export default function GlassTitle({ children, className = '' }: GlassTitleProps) {
  const [isDay, setIsDay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDay(document.body.classList.contains('day-mode'));
    const observer = new MutationObserver(() => {
      setIsDay(document.body.classList.contains('day-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!mounted || !isDay) {
    return <>{children}</>;
  }

  return (
    <span
      className={`inline-block relative ${className}`}
      style={{
        borderRadius: '12px',
        verticalAlign: 'middle',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.5),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1),
          0 4px 20px rgba(100, 160, 220, 0.1)
        `,
        padding: '10px 24px',
      }}
    >
      <span style={{ color: '#1a365d', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </span>
  );
}
