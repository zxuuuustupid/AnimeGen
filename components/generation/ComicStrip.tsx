'use client';

import React from 'react';
import Image from 'next/image';

interface ComicStripProps {
  panels: string[];
}

export function ComicStrip({ panels }: ComicStripProps) {
  if (!panels || panels.length === 0) {
    return (
      <p style={{ color: 'var(--sv-on-surface-variant)', fontSize: '14px' }}>暂无漫画</p>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div className="sv-section-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sv-on-surface)', letterSpacing: '-0.01em' }}>
          生成的漫画
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {panels.map((panel, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 'var(--sv-radius-lg)',
              overflow: 'hidden',
              background: 'var(--sv-surface-container)',
              border: '1px solid var(--sv-outline-variant)',
              transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease, border-color 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = 'var(--sv-shadow-xl)';
              e.currentTarget.style.borderColor = 'var(--sv-card-border-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--sv-outline-variant)';
            }}
          >
            <Image
              src={panel}
              alt={`漫画面板 ${index + 1}`}
              fill
              className="object-contain"
            />
            {/* Panel number badge */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
