import React from 'react';

/**
 * SmileGuard AI Official Brand Logo Component
 * Renders the official SVG logo asset cleanly on a crisp white/light badge container,
 * ensuring 100% vector clarity, no duplicate text, and elegant theme blending.
 */
export default function Logo({
  size = 'md',
  subtitle = 'Smarter Insights. Healthier Smiles.',
  variant = 'badge', // 'badge' | 'raw'
  className = '',
}) {
  const sizeHeight = {
    sm: 'h-9 sm:h-10',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-18',
    xl: 'h-20 sm:h-24',
  };

  const currentHeight = sizeHeight[size] || sizeHeight.md;

  if (variant === 'raw') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <img
          src="/assets/SmileGuard_AI_Logo.svg"
          alt="SmileGuard AI Official Logo"
          className={`${currentHeight} w-auto object-contain shrink-0 filter drop-shadow-md`}
        />
        {subtitle && (
          <span className="text-[10px] sm:text-[11px] font-medium text-purple-200 mt-1 tracking-tight">
            {subtitle}
          </span>
        )}
      </div>
    );
  }

  // Default 'badge' variant: Crisp white card container for 100% contrast & zero duplicate text
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-purple-100 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-300 hover:scale-[1.02]">
        <img
          src="/assets/SmileGuard_AI_Logo.svg"
          alt="SmileGuard AI Official Logo"
          className={`${currentHeight} w-auto object-contain shrink-0`}
        />
      </div>
      {subtitle && (
        <span className="text-[11px] sm:text-xs font-semibold text-purple-100/90 tracking-tight max-w-[160px] sm:max-w-[200px] leading-tight">
          {subtitle}
        </span>
      )}
    </div>
  );
}
