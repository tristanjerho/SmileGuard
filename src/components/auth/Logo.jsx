import React from 'react';

/**
 * SmileGuard AI Dental Brand Logo Component
 * Dental-focused SVG emblem with soft lavender and purple accenting.
 * Tagline: "Smarter Insights. Healthier Smiles."
 */
export default function Logo({ size = 'md', subtitle = 'Smarter Insights. Healthier Smiles.', className = '' }) {
  const sizeHeight = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  return (
    <div className={`inline-flex flex-col text-left select-none ${className}`}>
      <img
        src="/assets/SmileGuard_AI_Logo.svg"
        alt="SmileGuard AI"
        className={`${sizeHeight[size] || sizeHeight.md} w-auto object-contain shrink-0 transition-transform duration-200 hover:scale-[1.02]`}
      />
      {subtitle && (
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#667085] dark:text-[#A79BCE] mt-0.5 tracking-tight">
          {subtitle}
        </span>
      )}
    </div>
  );
}

