import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-solid border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-white/[.025] ${className}`}
    >
      {children}
    </div>
  );
}
