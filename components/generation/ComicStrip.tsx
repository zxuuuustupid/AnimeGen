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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'var(--sv-primary-container)',
            fontSize: '14px',
          }}
        >
          🎨
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--sv-on-surface)' }}>
          生成的漫画
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
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
              transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = 'var(--sv-shadow-xl)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
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
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
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
