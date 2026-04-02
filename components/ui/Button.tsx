import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    borderRadius: 'var(--sv-radius-full)',
    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    border: 'none',
    outline: 'none',
    letterSpacing: '0.01em',
    position: 'relative',
    overflow: 'hidden',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--sv-gradient-start), var(--sv-gradient-mid))',
      color: '#ffffff',
      boxShadow: 'var(--sv-shadow-md)',
    },
    secondary: {
      background: 'var(--sv-surface-container)',
      color: 'var(--sv-on-surface)',
      border: '1px solid var(--sv-outline-variant)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--sv-primary)',
      border: '1px solid var(--sv-outline)',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { height: '36px', padding: '0 16px', fontSize: '13px' },
    md: { height: '44px', padding: '0 24px', fontSize: '14px' },
    lg: { height: '52px', padding: '0 32px', fontSize: '16px' },
  };

  const combinedStyle: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      className={`sv-focus-ring ${className}`}
      style={combinedStyle}
      disabled={isDisabled}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          const target = e.currentTarget;
          target.style.transform = 'translateY(-1px)';
          if (variant === 'primary') {
            target.style.boxShadow = 'var(--sv-shadow-xl)';
          }
        }
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(0)';
        if (variant === 'primary') {
          target.style.boxShadow = 'var(--sv-shadow-md)';
        }
      }}
      {...props}
    >
      {loading && (
        <svg
          style={{
            animation: 'sv-spin 1s linear infinite',
            marginRight: '8px',
            width: '16px',
            height: '16px',
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="3"
            opacity={0.25}
          />
          <path
            d="M12 2a10 10 0 019.95 9"
            stroke="currentColor" strokeWidth="3"
            strokeLinecap="round"
            opacity={0.85}
          />
        </svg>
      )}
      {children}
    </button>
  );
}
