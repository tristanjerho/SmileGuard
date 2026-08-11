import React, { useState } from 'react';
import Logo from './Logo';
import HelpModal from './HelpModal';
import { ArrowLeft, ShieldCheck, Sparkles, Activity, Lock, Moon, Sun } from 'lucide-react';

/**
 * Split-screen AuthLayout Component for SmileGuard AI Patient Portal.
 * Features hero section with dental illustration, dynamic floating icons, glassmorphism card, and footer links.
 */
export default function AuthLayout({ children, isDarkMode, onToggleDarkMode, onBackToLanding }) {
  const [modalType, setModalType] = useState(null);

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Top Floating Bar */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <div>
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-md backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Portal Selection</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="pointer-events-auto p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-md backdrop-blur-md hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Hero Section (Split-Screen Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-slate-950 via-blue-950 to-teal-950 p-12 flex-col justify-between relative overflow-hidden text-white border-r border-slate-800">
          {/* Subtle Ambient Background Mesh & Lighting */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="z-10 flex items-center justify-between">
            <Logo size="md" showText={true} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/60 backdrop-blur-md text-[11px] font-semibold text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>HIPAA Compliant Workspace</span>
            </div>
          </div>

          {/* Center Graphic & Dental Illustration */}
          <div className="my-auto z-10 space-y-8 max-w-xl">
            {/* Custom SVG Dentist & Patient Graphic Illustration with Floating Icons */}
            <div className="relative w-full aspect-[16/9] max-h-72 rounded-2xl bg-gradient-to-tr from-slate-900/90 to-blue-900/40 border border-slate-800 p-6 shadow-2xl flex items-center justify-center overflow-hidden group">
              {/* Animated Floating Micro-Icons */}
              <div className="absolute top-4 left-6 p-2.5 rounded-xl bg-blue-600/20 border border-blue-400/30 text-blue-300 animate-float-slow backdrop-blur-md shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>

              <div className="absolute bottom-6 right-6 p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 animate-float-reverse backdrop-blur-md shadow-lg">
                <Activity className="h-5 w-5" />
              </div>

              <div className="absolute top-6 right-10 p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 animate-pulse backdrop-blur-md">
                <Lock className="h-4 w-4" />
              </div>

              {/* Main SVG Vector Illustration: Smiling Patient & Dentist with AI Dental Diagnostics */}
              <svg className="w-full h-full max-h-56 text-slate-100" viewBox="0 0 500 280" fill="none">
                {/* Background Tech Wave */}
                <path d="M20 180 Q 150 120, 250 180 T 480 140" stroke="#14B8A6" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
                
                {/* Diagnostic Scanner Ring */}
                <circle cx="250" cy="140" r="85" stroke="#2563EB" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
                <circle cx="250" cy="140" r="60" fill="url(#aiGradient)" opacity="0.25" />

                {/* Dentist Vector Silhouette */}
                <g transform="translate(110, 60)">
                  <rect x="25" y="40" width="70" height="120" rx="20" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                  <circle cx="60" cy="30" r="22" fill="#2563EB" opacity="0.9" />
                  <path d="M50 30 Q 60 40 70 30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <path d="M35 80 H 85" stroke="#14B8A6" strokeWidth="3" opacity="0.8" />
                  {/* Dental Mirror Tool */}
                  <path d="M75 90 L 125 60" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="128" cy="58" r="8" fill="none" stroke="#38BDF8" strokeWidth="3" />
                </g>

                {/* Patient Vector Silhouette (Smiling) */}
                <g transform="translate(290, 70)">
                  <rect x="25" y="40" width="75" height="110" rx="22" fill="#0F172A" stroke="#334155" strokeWidth="2" />
                  <circle cx="62" cy="28" r="24" fill="#14B8A6" opacity="0.85" />
                  {/* Wide Smile */}
                  <path d="M48 30 Q 62 46 76 30" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  <rect x="54" y="32" width="16" height="5" rx="2" fill="#FFFFFF" />
                </g>

                {/* Sparkle Tooth Emblem in Center */}
                <path
                  d="M250 115 C240 100, 230 115, 235 135 C238 147, 243 160, 250 165 C257 160, 262 147, 265 135 C270 115, 260 100, 250 115 Z"
                  fill="url(#toothGlow)"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />

                <defs>
                  <radialGradient id="aiGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="toothGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Headline and Supporting Text */}
            <div className="space-y-4">
              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
                Your Smile, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Smarter Than Ever.</span>
              </h1>
              <p className="text-sm xl:text-base text-slate-300 leading-relaxed font-normal">
                Securely access your appointments, treatment history, and AI-assisted dental records anytime, anywhere.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 text-xs font-semibold text-slate-300 pt-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
                ✨ CNN Radiograph AI Scans
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
                📅 Dynamic Appointment Slots
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
                🦷 Orthodontic Milestone Logs
              </span>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="z-10 text-xs text-slate-400 font-medium border-t border-slate-800/80 pt-4 flex items-center justify-between">
            <span>© 2026 SmileGuard AI. All rights reserved.</span>
            <span>v1.2.0 • Production</span>
          </div>
        </div>

        {/* Right Form Container (Centered Card) */}
        <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-12 flex flex-col justify-between items-center my-auto w-full">
          <div className="w-full max-w-md mx-auto my-auto space-y-6">
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex justify-center pb-2">
              <Logo size="lg" showText={true} />
            </div>

            {/* Centered Login Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-lg">
              {children}
            </div>

            {/* Footer Links */}
            <footer className="text-center space-y-3 pt-2">
              <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setModalType('privacy')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setModalType('terms')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
                >
                  Terms of Service
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setModalType('help')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:underline"
                >
                  Need Help?
                </button>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Encrypted & Secured with 256-Bit SSL • SmileGuard Health Security
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
