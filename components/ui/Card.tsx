import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverEffect?: boolean;
}

export function Card({ children, className = '', noPadding = false, hoverEffect = false }: CardProps) {
  return (
    <div
      className={`sv-animate-fade-in ${className}`}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
        borderRadius: 'var(--sv-radius-2xl)',
        padding: noPadding ? '0' : '28px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        ...(hoverEffect ? {
          cursor: 'pointer',
        } : {}),
      }}
      onMouseEnter={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 1)';
          e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 20px rgba(var(--sv-primary-rgb), 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverEffect) {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        }
      }}
    >
      {children}
    </div>
  );
}
