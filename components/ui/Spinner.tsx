import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes: Record<string, number> = {
    sm: 20,
    md: 36,
    lg: 52,
  };

  const s = sizes[size];
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 3.5 : 4;
  const r = (s - strokeWidth) / 2;
  const center = s / 2;

  return (
    <div className={className} style={{ position: 'relative', width: s, height: s }}>
      {/* Pulse ring background */}
      <div
        style={{
          position: 'absolute',
          inset: '-6px',
          borderRadius: '50%',
          background: 'var(--sv-primary)',
          opacity: 0.08,
          animation: 'sv-pulse-ring 2s ease-in-out infinite',
        }}
      />
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{ animation: 'sv-spin 1.2s linear infinite', display: 'block' }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--sv-outline-variant)"
          strokeWidth={strokeWidth}
        />
        {/* Active arc with gradient */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--sv-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * 0.3} ${2 * Math.PI * r * 0.7}`}
        />
      </svg>
    </div>
  );
}
