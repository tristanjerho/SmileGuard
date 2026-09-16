import React from 'react';
import { Stethoscope, User, ShieldCheck, Sparkles, Activity, Bell, Lock, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import PurpleWaveBackground from '../common/PurpleWaveBackground';

/**
 * PortalSelectionLanding Component
 * SmileGuard AI Dental Clinic SaaS Portal Gateway.
 * Wrapped in Deep Purple Wave Ambient Theme with glassmorphism cards.
 */
export default function PortalSelectionLanding({ onSelectDentistPortal, onSelectPatientPortal }) {
  return (
    <PurpleWaveBackground>
      <div className="w-full max-w-7xl mx-auto min-h-screen min-h-[100dvh] flex flex-col justify-between p-4 sm:p-8 lg:p-10 font-sans relative z-10">


        {/* Top Header Bar */}
        <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10">
          <Logo size="md" subtitle="Smarter Insights. Healthier Smiles." />

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-lg">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Secure Clinical Workstation • HIPAA Compliant</span>
          </div>
        </header>

        {/* Center Main Hero & Selection Area */}
        <main className="my-auto w-full max-w-4xl mx-auto text-center space-y-8 z-10 py-10">
          {/* Top AI Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-md animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI-Powered Dental Intelligence</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Smarter Insights. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300">
                Healthier Smiles.
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed max-w-xl mx-auto">
              SmileGuard AI integrates comprehensive dental clinic management with CNN-powered radiological X-ray analysis — empowering clinicians and providing patients with high-precision oral care.
            </p>
          </div>

          {/* Two Main Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
            {/* Card 1: Dentist & Admin Portal */}
            <div
              onClick={onSelectDentistPortal}
              className="group relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[24px] p-8 text-left shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.2)] hover:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />

              <div className="space-y-5 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-7 w-7" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-500/30">
                    Clinicians & Staff
                  </span>
                  <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors mt-2">
                    Dentist Portal
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Access AI diagnostic workstations, patient records, treatment history, laboratory tracking, and appointment queues.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white relative z-10">
                <span>Sign In to Clinician Workspace</span>
                <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Card 2: Patient Portal */}
            <div
              onClick={onSelectPatientPortal}
              className="group relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[24px] p-8 text-left shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.2)] hover:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />

              <div className="space-y-5 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <User className="h-7 w-7" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    Patients
                  </span>
                  <h3 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors mt-2">
                    Patient Portal
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Book dental appointments, review treatment progress, view dental X-rays, and manage clinic notifications.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white relative z-10">
                <span>Sign In to Patient Gateway</span>
                <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-md">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Feature Badges Footer */}
        <footer className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-semibold text-slate-400 pt-4 z-10">
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>CNN Radiological Diagnostics</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <Lock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Encrypted Patient Records</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            <span>Real-Time Notifications</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Treatment Timeline</span>
          </div>
        </footer>
      </div>
    </PurpleWaveBackground>
  );
}

