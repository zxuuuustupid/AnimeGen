'use client';

import React, { useState } from 'react';

interface StoryDisplayProps {
  story: string;
}

export function StoryDisplay({ story }: StoryDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            📖
          </div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--sv-on-surface)' }}>
            生成的故事
          </h2>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: 'var(--sv-radius-full)',
            border: '1px solid var(--sv-outline)',
            background: copied ? 'var(--sv-success-container)' : 'var(--sv-surface)',
            color: copied ? 'var(--sv-success)' : 'var(--sv-on-surface-variant)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!copied) e.currentTarget.style.borderColor = 'var(--sv-primary)';
          }}
          onMouseLeave={(e) => {
            if (!copied) e.currentTarget.style.borderColor = 'var(--sv-outline)';
          }}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              复制
            </>
          )}
        </button>
      </div>
      <div
        style={{
          padding: '24px',
          borderRadius: 'var(--sv-radius-lg)',
          background: 'var(--sv-surface-dim)',
          border: '1px solid var(--sv-outline-variant)',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.8,
          fontSize: '15px',
          color: 'var(--sv-on-surface)',
          letterSpacing: '0.01em',
        }}
      >
        {story}
      </div>
    </div>
  );
}
