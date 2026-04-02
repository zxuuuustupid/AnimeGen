import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`sv-animate-fade-in ${className}`}
      style={{
        background: 'var(--sv-surface)',
        border: '1px solid var(--sv-outline-variant)',
        borderRadius: 'var(--sv-radius-xl)',
        padding: '28px',
        boxShadow: 'var(--sv-shadow-sm)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--sv-shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--sv-outline)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--sv-shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--sv-outline-variant)';
      }}
    >
      {children}
    </div>
  );
}
