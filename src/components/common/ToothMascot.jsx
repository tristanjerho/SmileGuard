import React from 'react';

/**
 * Animated Tooth Mascot Component for SmileGuard AI
 * Features a friendly, cheerful dental mascot with floating sparkles,
 * expressive eyes, rosy cheeks, and smooth CSS animations.
 */
export default function ToothMascot({ size = 'md', className = '', interactive = true }) {
  // Dimension mappings
  const dimensions = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
    xl: 'w-48 h-48 sm:w-56 sm:h-56',
  };

  const selectedSize = dimensions[size] || dimensions.md;

  return (
    <div className={`relative inline-flex items-center justify-center group ${selectedSize} ${className}`}>
      {/* Soft Ambient Radial Glow behind Mascot */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/20 via-indigo-500/30 to-purple-500/20 blur-xl animate-pulse pointer-events-none" />

      {/* Floating Sparkles around Mascot */}
      <div className="absolute -top-2 -right-2 text-amber-300 animate-bounce text-sm sm:text-base pointer-events-none z-20">
        ✨
      </div>
      <div className="absolute top-1/4 -left-3 text-cyan-300 animate-pulse text-xs sm:text-sm pointer-events-none z-20 transition-transform group-hover:scale-125">
        ✦
      </div>
      <div className="absolute -bottom-1 right-1 text-purple-300 text-xs pointer-events-none z-20 animate-spin-slow">
        ✨
      </div>

      {/* Main Floating Tooth Mascot SVG */}
      <svg
        className={`w-full h-full drop-shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition-all duration-300 ${
          interactive ? 'hover:scale-110 cursor-pointer' : ''
        } animate-tooth-float`}
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Tooth Body Pearl Gradient */}
          <linearGradient id="toothBodyGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F3F0FF" />
            <stop offset="100%" stopColor="#E2D9FF" />
          </linearGradient>

          {/* Shiny Specular Highlight */}
          <linearGradient id="toothHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          {/* AI Shield Badge Gradient */}
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Tooth Body (Friendly Molor shape with 2 roots) */}
        <path
          d="M 100 25 
             C 135 25, 175 40, 175 85
             C 175 115, 165 140, 155 170
             C 148 190, 130 195, 122 170
             C 114 148, 106 148, 98 148
             C 90 148, 82 148, 74 170
             C 66 195, 48 190, 41 170
             C 31 140, 21 115, 21 85
             C 21 40, 61 25, 100 25 Z"
          fill="url(#toothBodyGrad)"
          stroke="#C4B5FD"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Top Left Specular Sheen (Shine Curve) */}
        <path
          d="M 45 45 C 70 32, 95 30, 115 32 C 100 40, 65 48, 48 70 C 44 60, 44 50, 45 45 Z"
          fill="url(#toothHighlight)"
        />

        {/* Friendly Expressive Eyes */}
        <g className="animate-eye-blink">
          {/* Left Eye */}
          <ellipse cx="75" cy="82" rx="9" ry="11" fill="#1E1B4B" />
          <circle cx="72" cy="78" r="3.5" fill="#FFFFFF" />
          <circle cx="78" cy="85" r="1.5" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="125" cy="82" rx="9" ry="11" fill="#1E1B4B" />
          <circle cx="122" cy="78" r="3.5" fill="#FFFFFF" />
          <circle cx="128" cy="85" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Cute Rosy Blush Cheeks */}
        <ellipse cx="60" cy="98" rx="8" ry="5" fill="#F472B6" opacity="0.6" />
        <ellipse cx="140" cy="98" rx="8" ry="5" fill="#F472B6" opacity="0.6" />

        {/* Joyful Open Smile Mouth */}
        <path
          d="M 82 98 Q 100 118 118 98"
          fill="#818CF8"
          stroke="#1E1B4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Cute Tongue inside mouth */}
        <path
          d="M 91 107 Q 100 117 109 107 Q 100 102 91 107 Z"
          fill="#F472B6"
        />

        {/* Waving Right Arm / Hand */}
        <g className="animate-tooth-wave origin-[160px_100px]">
          <path
            d="M 160 100 C 178 95, 188 80, 182 68 C 176 58, 162 66, 155 82"
            fill="#FFFFFF"
            stroke="#C4B5FD"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Hand Glove / Sparkle Paw */}
          <circle cx="180" cy="68" r="6" fill="#F3F0FF" stroke="#C4B5FD" strokeWidth="2" />
        </g>

        {/* Left Arm Resting Cutely */}
        <path
          d="M 38 102 C 22 110, 18 125, 26 132 C 34 138, 42 122, 43 112"
          fill="#FFFFFF"
          stroke="#C4B5FD"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* SmileGuard AI Shield Chest Emblem */}
        <g transform="translate(85, 118) scale(0.7)">
          <path
            d="M 21 3 C 32 3, 40 0, 40 0 C 40 0, 42 22, 21 39 C 0 22, 2 0, 2 0 C 2 0, 10 3, 21 3 Z"
            fill="url(#shieldGrad)"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          {/* White Mini Sparkle inside Shield */}
          <path
            d="M 21 10 L 23 17 L 30 19 L 23 21 L 21 28 L 19 21 L 12 19 L 19 17 Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
}
