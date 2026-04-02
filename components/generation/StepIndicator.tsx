'use client';

import React from 'react';

interface Step {
  step: number;
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface StepIndicatorProps {
  steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="w-full" style={{ padding: '8px 0' }}>
      <div className="flex items-center justify-between">
        {steps.map((s, index) => (
          <React.Fragment key={s.step}>
            <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
              {/* Step circle */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                  ...(s.status === 'completed'
                    ? {
                        background: 'linear-gradient(135deg, var(--sv-gradient-start), var(--sv-gradient-mid))',
                        color: '#ffffff',
                        boxShadow: '0 2px 10px rgba(108, 92, 231, 0.25)',
                      }
                    : s.status === 'current'
                    ? {
                        background: 'var(--sv-primary-container)',
                        color: 'var(--sv-on-primary-container)',
                        boxShadow: '0 0 0 2px var(--sv-primary-light)',
                      }
                    : {
                        background: 'var(--sv-surface-container)',
                        color: 'var(--sv-on-surface-variant)',
                        opacity: 0.6,
                      }),
                }}
              >
                {/* Pulse ring for current step */}
                {s.status === 'current' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-3px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--sv-primary)',
                      opacity: 0.25,
                      animation: 'sv-pulse-ring 2.5s ease-in-out infinite',
                    }}
                  />
                )}
                {s.status === 'completed' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s.step
                )}
              </div>
              {/* Step label */}
              <span
                style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  fontWeight: s.status === 'current' ? 600 : 500,
                  color: s.status === 'current'
                    ? 'var(--sv-primary)'
                    : s.status === 'completed'
                    ? 'var(--sv-on-surface)'
                    : 'var(--sv-on-surface-variant)',
                  opacity: s.status === 'pending' ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em',
                }}
              >
                {s.label}
              </span>
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  margin: '0 6px',
                  marginBottom: '22px',
                  borderRadius: '1px',
                  background: steps[index + 1].status !== 'pending'
                    ? 'linear-gradient(90deg, var(--sv-gradient-start), var(--sv-gradient-mid))'
                    : 'var(--sv-outline-variant)',
                  transition: 'background 0.6s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Shimmer effect on active connector */}
                {steps[index + 1].status !== 'pending' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'sv-shimmer 2s linear infinite',
                    }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
