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
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((s, index) => (
          <React.Fragment key={s.step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  s.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : s.status === 'current'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {s.status === 'completed' ? '✓' : s.step}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  s.status === 'current'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  steps[index + 1].status === 'pending'
                    ? 'bg-gray-200 dark:bg-gray-800'
                    : 'bg-green-500'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
