import React, { useState } from 'react';
import Logo from './Logo';
import HelpModal from './HelpModal';
import ToothMascot from '../common/ToothMascot';
import { ArrowLeft, ShieldCheck, Sparkles, Activity, Lock, Moon, Sun } from 'lucide-react';
import PurpleWaveBackground from '../common/PurpleWaveBackground';

/**
 * Split-screen AuthLayout Component for SmileGuard AI Dental Portal.
 * Wrapped in Deep Purple Wave Ambient Theme with glassmorphic cards.
 */
export default function AuthLayout({ children, isDarkMode, onToggleDarkMode, onBackToLanding, onSwitchToAdmin }) {
  const [modalType, setModalType] = useState(null);

  return (
    <PurpleWaveBackground>
      <div className="min-h-screen min-h-[100dvh] w-full flex flex-col font-sans relative">


        {/* Top Floating Bar */}
        <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 shadow-md backdrop-blur-md transition-all active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Portal Selection</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* Left Hero Section (Split-Screen Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800 bg-slate-900/40 backdrop-blur-md">
            {/* Top Brand Tag */}
            <div className="z-10 flex items-center justify-between">
              <Logo size="md" subtitle="Smarter Insights. Healthier Smiles." />
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 shadow-xs text-[11px] font-bold text-indigo-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>HIPAA Compliant Dental Platform</span>
              </div>
            </div>

            {/* Center Graphic & Dental Showcase */}
            <div className="my-auto z-10 space-y-8 max-w-xl">
              {/* Dental Feature Showcase Box with Animated Tooth Mascot */}
              <div className="relative w-full rounded-[24px] bg-slate-900/80 border border-slate-800 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center overflow-hidden group">
                {/* Animated Tooth Mascot & Brand SVG Showcase */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                  <ToothMascot size="lg" />
                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-300 tracking-wide uppercase bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Smart Radiological Intelligence</span>
                  </div>
                </div>
              </div>

              {/* Headline and Supporting Text */}
              <div className="space-y-3">
                <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  Smarter Insights. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300">
                    Healthier Smiles.
                  </span>
                </h1>
                <p className="text-sm xl:text-base text-purple-200/90 leading-relaxed font-medium">
                  Streamline dental practice workflows with AI-assisted radiological diagnosis, patient record encryption, and real-time appointment tracking.
                </p>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-2.5 text-xs font-semibold text-purple-200 pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-500/30 shadow-xs">
                  ✨ CNN Dental Radiograph AI
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-500/30 shadow-xs">
                  📅 Clinical Appointments Queue
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-500/30 shadow-xs">
                  🦷 Orthodontic Milestone Logs
                </span>
              </div>
            </div>

            {/* Bottom Copyright */}
            <div className="z-10 text-xs text-purple-300/80 font-medium border-t border-purple-500/20 pt-4 flex items-center justify-between">
              <span>© 2026 SmileGuard AI • Clinical Platform</span>
              <span>v1.2.0</span>
            </div>
          </div>

          {/* Right Form Container (Centered Card) */}
          <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-12 flex flex-col justify-between items-center my-auto w-full bg-purple-950/20 backdrop-blur-md">
            <div className="w-full max-w-md mx-auto my-auto space-y-6">
              {/* Mobile Header Logo */}
              <div className="lg:hidden flex justify-center pb-2">
                <Logo size="lg" subtitle="Smarter Insights. Healthier Smiles." />
              </div>

              {/* Centered Glassmorphic Login Card */}
              <div className="bg-[#FFFFFF] dark:bg-[#1A1435]/90 border border-[#E9E5F5] dark:border-[#2C2256] rounded-[24px] p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                {children}
              </div>

              {/* Footer Links */}
              <footer className="text-center space-y-3 pt-2">
                <div className="flex items-center justify-center gap-4 text-xs font-medium text-purple-200">
                  <button
                    type="button"
                    onClick={() => setModalType('privacy')}
                    className="hover:text-purple-300 transition-colors focus:outline-none focus:underline"
                  >
                    Privacy Policy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setModalType('terms')}
                    className="hover:text-purple-300 transition-colors focus:outline-none focus:underline"
                  >
                    Terms of Service
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setModalType('help')}
                    className="hover:text-purple-300 transition-colors focus:outline-none focus:underline"
                  >
                    Need Help?
                  </button>
                </div>

                <p className="text-[11px] text-purple-300/80 font-medium">
                  Protected by 256-Bit SSL Encryption • SmileGuard Dental Health Security
                </p>
              </footer>
            </div>
          </div>
        </div>

        {/* Interactive Modal for Privacy / Terms / Support */}
        <HelpModal
          type={modalType}
          isOpen={Boolean(modalType)}
          onClose={() => setModalType(null)}
        />
      </div>
    </PurpleWaveBackground>
  );
}

