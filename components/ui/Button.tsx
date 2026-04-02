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
    fontWeight: 600,
    borderRadius: 'var(--sv-radius-full)',
    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.45 : 1,
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
      boxShadow: '0 2px 12px rgba(108, 92, 231, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08)',
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
    lg: { height: '52px', padding: '0 36px', fontSize: '15px' },
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
            target.style.boxShadow = '0 4px 20px rgba(108, 92, 231, 0.35), 0 2px 6px rgba(0, 0, 0, 0.08)';
          } else if (variant === 'secondary') {
            target.style.borderColor = 'var(--sv-outline)';
          }
        }
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(0)';
        if (variant === 'primary') {
          target.style.boxShadow = '0 2px 12px rgba(108, 92, 231, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08)';
        } else if (variant === 'secondary') {
          target.style.borderColor = 'var(--sv-outline-variant)';
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
            opacity={0.2}
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
