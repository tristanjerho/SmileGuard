import React, { useState } from 'react';
import Logo from './Logo';
import HelpModal from './HelpModal';
import { ArrowLeft, ShieldCheck, Sparkles, Activity, Lock, Moon, Sun } from 'lucide-react';

/**
 * Split-screen AuthLayout Component for SmileGuard AI Dental Portal.
 * White + Soft Lavender palette, dental illustrations, and clean card styling.
 */
export default function AuthLayout({ children, isDarkMode, onToggleDarkMode, onBackToLanding, onSwitchToAdmin }) {
  const [modalType, setModalType] = useState(null);

  return (
    <div className="min-h-screen w-screen bg-[#FFFFFF] text-[#263238] flex flex-col font-sans relative overflow-hidden">
      {/* Top Floating Bar */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E9E5F5] text-xs font-bold text-[#263238] hover:text-[#8B5CF6] hover:bg-[#F7F5FF] shadow-xs backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Portal Selection</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToAdmin && (
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7F5FF] border border-[#E9E5F5] text-xs font-bold text-[#6D5AE6] hover:bg-[#F0ECFF] shadow-xs backdrop-blur-md transition-all active:scale-95"
            >
              <Lock className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>Clinician / Admin Portal</span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="pointer-events-auto p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E9E5F5] text-[#667085] shadow-xs hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-[#263238]" />}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Hero Section (Split-Screen Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#F7F5FF] p-12 flex-col justify-between relative overflow-hidden text-[#263238] border-r border-[#E9E5F5]">
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F0ECFF] rounded-full blur-3xl pointer-events-none opacity-80" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E9E5F5] rounded-full blur-3xl pointer-events-none opacity-80" />

          {/* Top Brand Tag */}
          <div className="z-10 flex items-center justify-between">
            <Logo size="md" subtitle="Smarter Insights. Healthier Smiles." />
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E9E5F5] shadow-xs text-[11px] font-bold text-[#8B5CF6]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>HIPAA Compliant Dental Platform</span>
            </div>
          </div>

          {/* Center Graphic & Dental Illustration */}
          <div className="my-auto z-10 space-y-8 max-w-xl">
            {/* Dental Feature Showcase Box */}
            <div className="relative w-full aspect-[16/9] max-h-72 rounded-[24px] bg-[#FFFFFF] border border-[#E9E5F5] p-8 shadow-[0_4px_24px_rgba(100,80,180,0.08)] flex flex-col items-center justify-center overflow-hidden group">
              {/* Floating Ambient Badges */}
              <div className="absolute top-4 left-6 p-2.5 rounded-xl bg-[#F0ECFF] border border-[#E9E5F5] text-[#8B5CF6] animate-float-slow shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>

              <div className="absolute bottom-6 right-6 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[#10B981] animate-float-reverse shadow-xs">
                <Activity className="h-5 w-5" />
              </div>

              <div className="absolute top-6 right-8 p-2 rounded-lg bg-[#F7F5FF] border border-[#E9E5F5] text-[#6D5AE6]">
                <Lock className="h-4 w-4" />
              </div>

              {/* Official Brand SVG Showcase */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F7F5FF] to-[#FFFFFF] border border-[#E9E5F5] shadow-xs transform group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/assets/SmileGuard_AI_Logo.svg"
                    alt="SmileGuard AI Official Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] tracking-wide uppercase">
                  <span>Smart Radiological Intelligence</span>
                </div>
              </div>
            </div>

            {/* Headline and Supporting Text */}
            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-black text-[#263238] tracking-tight leading-tight">
                Smarter Insights. <br />
                <span className="text-[#8B5CF6]">Healthier Smiles.</span>
              </h1>
              <p className="text-sm xl:text-base text-[#667085] leading-relaxed font-medium">
                Streamline dental practice workflows with AI-assisted radiological diagnosis, patient record encryption, and real-time appointment tracking.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2.5 text-xs font-semibold text-[#667085] pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E9E5F5] shadow-xs">
                ✨ CNN Dental Radiograph AI
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E9E5F5] shadow-xs">
                📅 Clinical Appointments Queue
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E9E5F5] shadow-xs">
                🦷 Orthodontic Milestone Logs
              </span>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="z-10 text-xs text-[#667085] font-medium border-t border-[#E9E5F5] pt-4 flex items-center justify-between">
            <span>© 2026 SmileGuard AI • Clinical Platform</span>
            <span>v1.2.0</span>
          </div>
        </div>

        {/* Right Form Container (Centered Card) */}
        <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-12 flex flex-col justify-between items-center my-auto w-full bg-[#FFFFFF]">
          <div className="w-full max-w-md mx-auto my-auto space-y-6">
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex justify-center pb-2">
              <Logo size="lg" subtitle="Smarter Insights. Healthier Smiles." />
            </div>

            {/* Centered White Login Card */}
            <div className="bg-[#FFFFFF] border border-[#E9E5F5] rounded-[24px] p-6 sm:p-10 shadow-[0_4px_20px_rgba(100,80,180,0.06)]">
              {children}
            </div>

            {/* Footer Links */}
            <footer className="text-center space-y-3 pt-2">
              <div className="flex items-center justify-center gap-4 text-xs font-medium text-[#667085]">
                <button
                  type="button"
                  onClick={() => setModalType('privacy')}
                  className="hover:text-[#8B5CF6] transition-colors focus:outline-none focus:underline"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setModalType('terms')}
                  className="hover:text-[#8B5CF6] transition-colors focus:outline-none focus:underline"
                >
                  Terms of Service
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setModalType('help')}
                  className="hover:text-[#8B5CF6] transition-colors focus:outline-none focus:underline"
                >
                  Need Help?
                </button>
              </div>

              <p className="text-[11px] text-[#667085] font-medium">
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
  );
}

