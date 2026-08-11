import React, { useState } from 'react';
import Spinner from './Spinner';

/**
 * Custom Button Component with Micro-ripple effect, loading state, and WCAG compliance.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = true,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ariaLabel,
  icon: Icon,
}) {
  const [ripples, setRipples] = useState([]);

  const handleRipple = (e) => {
    if (disabled || isLoading) return;
    const button = e.currentTarget.getBoundingClientRect();
    const diameter = Math.max(button.width, button.height);
    const radius = diameter / 2;

    const newRipple = {
      x: e.clientX - button.left - radius,
      y: e.clientY - button.top - radius,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e) => {
    handleRipple(e);
    if (onClick && !disabled && !isLoading) {
      onClick(e);
    }
  };

  const baseStyles =
    'relative overflow-hidden font-bold rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2.5 active:scale-[0.98] select-none';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500',
    secondary:
      'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 focus:ring-teal-400 dark:bg-teal-600 dark:hover:bg-teal-500',
    outline:
      'bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:ring-slate-400',
  };

  const disabledStyles =
    'opacity-60 cursor-not-allowed pointer-events-none shadow-none transform-none';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-disabled={disabled || isLoading}
      aria-label={ariaLabel}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${fullWidth ? 'w-full py-3.5 px-5' : 'py-2.5 px-4'}
        ${disabled || isLoading ? disabledStyles : ''}
        ${className}
      `}
    >
      {/* Ripple Animation Layer */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: '60px',
            height: '60px',
          }}
        />
      ))}

      {isLoading ? (
        <>
          <Spinner size="sm" className="text-current" />
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
