import React from 'react';

/**
 * PurpleWaveBackground Component
 * Renders a sleek, neutral dark slate background with soft ambient indigo glows.
 * Easy on the eyes with balanced contrast and gentle organic wave accents.
 */
export default function PurpleWaveBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen min-h-[100dvh] w-full max-w-full bg-[#0F1420] text-slate-100 overflow-x-hidden ${className}`}>

      {/* Sleek Dark Slate & Soft Lavender-Midnight Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1220] via-[#161F38] to-[#261E4E] z-0" />

      {/* Gentle Soft 10% Lighter Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-purple-500/20 blur-[140px] pointer-events-none z-0" />
      <div className="absolute -bottom-40 left-1/3 w-[700px] h-[550px] rounded-full bg-blue-500/18 blur-[130px] pointer-events-none z-0" />

      {/* Subtle Soft Organic Wave Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 overflow-hidden">
        <svg
          className="absolute bottom-0 left-0 w-full h-full min-h-[600px] object-cover"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-100 900 C300 700 600 840 1000 720 C1300 620 1500 750 1600 900 Z"
            fill="url(#slateWaveGrad1)"
            opacity="0.5"
          />
          <path
            d="M-100 900 C200 650 550 820 950 630 C1250 480 1480 620 1600 900 Z"
            fill="url(#slateWaveGrad2)"
            opacity="0.4"
          />

          <defs>
            <linearGradient id="slateWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="slateWaveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Subtle Inset Vignette */}
      <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.4)]" />

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
