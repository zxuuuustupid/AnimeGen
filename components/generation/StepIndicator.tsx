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
            <div className="flex flex-col items-center" style={{ minWidth: '56px' }}>
              {/* Step circle */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                  ...(s.status === 'completed'
                    ? {
                        background: 'linear-gradient(135deg, var(--sv-gradient-start), var(--sv-gradient-mid))',
                        color: '#ffffff',
                        boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
                      }
                    : s.status === 'current'
                    ? {
                        background: 'var(--sv-primary-container)',
                        color: 'var(--sv-on-primary-container)',
                        boxShadow: '0 0 0 3px var(--sv-primary-light)',
                      }
                    : {
                        background: 'var(--sv-surface-container)',
                        color: 'var(--sv-on-surface-variant)',
                      }),
                }}
              >
                {/* Pulse ring for current step */}
                {s.status === 'current' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-4px',
                      borderRadius: '50%',
                      border: '2px solid var(--sv-primary)',
                      opacity: 0.3,
                      animation: 'sv-pulse-ring 2s ease-in-out infinite',
                    }}
                  />
                )}
                {s.status === 'completed' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                  fontSize: '12px',
                  fontWeight: s.status === 'current' ? 600 : 500,
                  color: s.status === 'current' ? 'var(--sv-primary)' : 'var(--sv-on-surface-variant)',
                  transition: 'color 0.3s ease',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
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
                  height: '3px',
                  margin: '0 8px',
                  marginBottom: '24px',
                  borderRadius: '2px',
                  background: steps[index + 1].status !== 'pending'
                    ? 'linear-gradient(90deg, var(--sv-gradient-start), var(--sv-gradient-mid))'
                    : 'var(--sv-surface-container-high)',
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
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
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
