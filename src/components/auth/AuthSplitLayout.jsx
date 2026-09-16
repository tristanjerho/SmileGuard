import React from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import PurpleWaveBackground from '../common/PurpleWaveBackground';
import Logo from './Logo';
import ToothMascot from '../common/ToothMascot';

/**
 * AuthSplitLayout — Shared split-screen authentication layout.
 * Used by both the Patient Portal and Dentist/Admin Portal to ensure
 * full visual consistency: same proportions, card size, spacing, and typography.
 *
 * LEFT  (~55%) : Branding panel — mascot, hero text, feature badges
 * RIGHT (~45%) : Auth card — form content passed as children
 */
export default function AuthSplitLayout({
  // Navigation
  onBack,
  // Left panel copy
  leftTitle1 = 'Smarter Insights.',
  leftTitle2 = 'Healthier Smiles.',
  leftDescription = 'Streamline dental practice workflows with AI-assisted radiological diagnosis, patient record encryption, and real-time appointment tracking.',
  leftBadges = [
    '✨ CNN Dental Radiograph AI',
    '📅 Clinical Appointments Queue',
    '🦷 Orthodontic Milestone Logs',
  ],
  leftMascotBadge = 'Smart Radiological Intelligence',
  // Header right badge text
  headerRightLabel = 'HIPAA Compliant Dental Platform',
  // Footer copy
  footerLeft = '© 2026 SmileGuard AI • Clinical Platform',
  footerRight = 'v1.2.0',
  // Optional slot below the auth card (e.g. footer links, legal)
  footerContent,
  // Form content rendered inside the shared auth card
  children,
}) {
  return (
    <PurpleWaveBackground>
      <div className="min-h-screen min-h-[100dvh] w-full font-sans flex flex-col relative">

        {/* ── Floating Header Bar ────────────────────────────────── */}
        <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 pointer-events-none">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="pointer-events-auto flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-[11px] sm:text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 shadow-md backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Back to Portal Selection</span>
              <span className="xs:hidden">Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 text-[10px] sm:text-[11px] font-bold text-indigo-300 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">{headerRightLabel}</span>
            <span className="sm:hidden">HIPAA Secure</span>
          </div>
        </header>

        {/* ── Main Split Body ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen">

          {/* ─── LEFT PANEL ─── Desktop: 55%, Hidden on mobile ─── */}
          <aside
            aria-label="SmileGuard AI branding panel"
            className="hidden lg:flex lg:w-[55%] shrink-0 flex-col justify-between p-10 xl:p-14 border-r border-slate-800/50 bg-slate-900/30 backdrop-blur-sm relative overflow-hidden"
          >
            {/* Ambient background glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-purple-700/12 blur-[90px]" />
              <div className="absolute bottom-10 right-0 w-64 h-64 rounded-full bg-indigo-700/12 blur-[90px]" />
            </div>

            {/* Brand header */}
            <div className="relative z-10 mt-10">
              <Logo size="md" subtitle="" />
            </div>

            {/* Center: Mascot + Hero Copy */}
            <div className="relative z-10 my-auto space-y-6 max-w-[480px]">
              {/* Mascot container */}
              <div className="relative rounded-[20px] bg-slate-900/60 border border-slate-700/50 p-8 flex flex-col items-center justify-center overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                {/* Subtle inner glow */}
                <div
                  className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.10) 0%, transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <ToothMascot size="lg" />
                  <span className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-indigo-300 tracking-widest uppercase bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/60 mt-1">
                    <Sparkles className="h-3 w-3 text-violet-400" />
                    {leftMascotBadge}
                  </span>
                </div>
              </div>

              {/* Hero text */}
              <div className="space-y-2.5">
                <h1 className="text-[1.9rem] xl:text-[2.35rem] font-black text-white tracking-tight leading-[1.15]">
                  {leftTitle1}
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #c4b5fd 0%, #a78bfa 40%, #818cf8 100%)',
                    }}
                  >
                    {leftTitle2}
                  </span>
                </h1>
                <p className="text-sm text-purple-200/70 leading-relaxed font-medium max-w-sm">
                  {leftDescription}
                </p>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-2">
                {leftBadges.map((badge, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/20 text-[11px] font-semibold text-purple-200"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Left panel footer */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-purple-300/55 font-medium border-t border-slate-700/40 pt-4">
              <span>{footerLeft}</span>
              <span>{footerRight}</span>
            </div>
          </aside>

          {/* ─── RIGHT PANEL ─── Desktop: 45% | Mobile: full width ─── */}
          <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 py-6 bg-[rgba(10,10,25,0.15)]">

            {/* Mobile-only branding (stacks above the card) */}
            <div className="lg:hidden w-full max-w-sm mx-auto flex flex-col items-center gap-3 pt-20 pb-5">
              <Logo size="md" subtitle="" />
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/60 p-4 mt-1 flex flex-col items-center gap-2 w-full">
                <ToothMascot size="md" />
                <div className="text-center">
                  <p className="text-base font-black text-white leading-tight">
                    {leftTitle1}
                  </p>
                  <p
                    className="text-base font-black bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #c4b5fd 0%, #a78bfa 50%, #818cf8 100%)',
                    }}
                  >
                    {leftTitle2}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Shared Auth Card ── */}
            <div className="w-full max-w-[440px] mx-auto">
              <div
                className="rounded-[20px] border border-slate-700/60 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                style={{ background: 'rgba(10, 12, 28, 0.88)' }}
              >
                {children}
              </div>

              {/* Optional slot: footer links, legal copy, etc. */}
              {footerContent && (
                <div className="mt-5 text-center">
                  {footerContent}
                </div>
              )}
            </div>

            {/* Mobile footer version */}
            <p className="lg:hidden mt-8 text-[10px] text-purple-300/40 font-medium text-center pb-4">
              {footerLeft} • {footerRight}
            </p>
          </div>
        </div>
      </div>
    </PurpleWaveBackground>
  );
}
