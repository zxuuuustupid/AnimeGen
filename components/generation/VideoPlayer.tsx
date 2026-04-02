'use client';

import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
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
          🎬
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--sv-on-surface)' }}>
          生成的视频
        </h2>
      </div>
      <div
        style={{
          position: 'relative',
          aspectRatio: '16/9',
          borderRadius: 'var(--sv-radius-lg)',
          overflow: 'hidden',
          background: '#000000',
          border: '1px solid var(--sv-outline-variant)',
          boxShadow: 'var(--sv-shadow-lg)',
        }}
      >
        <video
          src={videoUrl}
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
}
