import React from 'react';

/**
 * SmileGuard AI Brand Logo Component
 * WCAG-compliant, responsive SVG emblem with gradient styling.
 */
export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 ring-2 ring-white/20 transform transition-transform hover:scale-105 duration-300 shrink-0`}
        aria-hidden="true"
      >
        <svg
          className={`${iconSizes[size] || iconSizes.md} text-white fill-current`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 1.95.83 4.29.98 6.55.33 2.58-.74 4.54-2.74 5.23-5.34 1.76 1.48 3.51 3.51 4.1 6.07C19.46 16.32 16.08 20 12 20z" />
          <circle cx="9" cy="9" r="1.2" />
          <circle cx="15" cy="9" r="1.2" />
          <path d="M12 16.5c-2.33 0-4.32-1.45-5.12-3.5h10.24c-.8 2.05-2.79 3.5-5.12 3.5z" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            SmileGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400">AI</span>
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5">
            Patient Portal
          </span>
        </div>
      )}
    </div>
  );
}
