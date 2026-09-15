import React from 'react';
import ToothMascot from './ToothMascot';
import PurpleWaveBackground from './PurpleWaveBackground';

/**
 * MascotLoader Component
 * Renders the animated Tooth Mascot with floating sparkles,
 * a subtle progress ring, and customizable loading text.
 * Used for App initialization, logout transition, AI processing, and data fetching.
 */
export default function MascotLoader({
  message = 'Initializing SmileGuard AI Workspace...',
  fullScreen = true,
  size = 'lg',
}) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-6 text-center p-6 z-10 animate-fade-in">
      {/* Tooth Mascot Container with Pulsing Halo */}
      <div className="relative">
        <ToothMascot size={size} interactive={false} />
      </div>

      {/* Message and Subtext */}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase drop-shadow-sm flex items-center justify-center gap-2">
          <span>{message}</span>
        </h3>
        <p className="text-xs text-indigo-300/80 font-semibold tracking-wider uppercase animate-pulse">
          Smarter Insights • Healthier Smiles
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <PurpleWaveBackground className="flex items-center justify-center">
        {content}
      </PurpleWaveBackground>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center rounded-2xl bg-slate-900/60 border border-slate-800">
      {content}
    </div>
  );
}
