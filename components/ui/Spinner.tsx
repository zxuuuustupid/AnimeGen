import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes: Record<string, number> = {
    sm: 20,
    md: 32,
    lg: 44,
  };

  const s = sizes[size];
  const strokeWidth = size === 'sm' ? 2.5 : size === 'md' ? 3 : 3.5;
  const r = (s - strokeWidth) / 2;
  const center = s / 2;
  const gradientId = `spinner-grad-${size}`;

  return (
    <div className={className} style={{ position: 'relative', width: s, height: s }}>
      {/* Subtle pulse ring */}
      <div
        style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: '50%',
          background: 'var(--sv-primary)',
          opacity: 0.05,
          animation: 'sv-pulse-ring 2.5s ease-in-out infinite',
        }}
      />
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{ animation: 'sv-spin 1.2s linear infinite', display: 'block' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--sv-gradient-start)" />
            <stop offset="100%" stopColor="var(--sv-gradient-mid)" />
          </linearGradient>
        </defs>
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
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * 0.28} ${2 * Math.PI * r * 0.72}`}
        />
      </svg>
    </div>
  );
}
