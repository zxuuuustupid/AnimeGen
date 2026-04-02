'use client';

import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div className="sv-section-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sv-on-surface)', letterSpacing: '-0.01em' }}>
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
