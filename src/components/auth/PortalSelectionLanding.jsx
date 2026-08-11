import React from 'react';
import { Stethoscope, User, ShieldCheck, Sparkles, Activity, Bell, Lock } from 'lucide-react';
import Logo from './Logo';

/**
 * PortalSelectionLanding Component
 * Pixel-perfect implementation of the SmileGuard AI main landing gateway.
 * Allows users to choose between the Dentist Portal and the Patient Portal.
 */
export default function PortalSelectionLanding({ onSelectDentistPortal, onSelectPatientPortal }) {
  return (
    <div className="min-h-screen w-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-10 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Subtle Gradient Lighting */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Logo size="md" showText={false} />
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              SmileGuard <span className="text-teal-600 dark:text-teal-400">AI</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Dental Clinic Management System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
          <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span>Secure • HIPAA-aware</span>
        </div>
      </header>

      {/* Center Main Hero & Selection Area */}
      <main className="my-auto w-full max-w-4xl mx-auto text-center space-y-8 z-10 py-8">
        {/* Top AI Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold shadow-sm animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>AI-Powered Dental Care</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Modern dentistry, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400">
              smarter outcomes.
            </span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            SmileGuard AI combines clinic management with CNN-powered diagnostic assistance — helping dentists detect issues early and patients stay on top of their oral health.
          </p>
        </div>

        {/* Two Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
          {/* Card 1: Dentist Portal */}
          <div
            onClick={onSelectDentistPortal}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 text-left shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors" />

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Dentist Portal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Patient records, appointments, braces monitoring, and AI diagnostic tools.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:gap-2.5 transition-all">
              <span>Enter Portal</span>
              <span className="text-sm">&rarr;</span>
            </div>
          </div>

          {/* Card 2: Patient Portal */}
          <div
            onClick={onSelectPatientPortal}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 text-left shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <User className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Patient Portal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Book appointments, track treatment progress, and stay updated on your health.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
              <span>Enter Portal</span>
              <span className="text-sm">&rarr;</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Feature Badges Footer */}
      <footer className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-4 z-10">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>CNN-Powered Diagnostics</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Secure Records</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Smart Reminders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Braces Tracking</span>
        </div>
      </footer>
    </div>
  );
}
