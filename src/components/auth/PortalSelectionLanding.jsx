import React from 'react';
import { Stethoscope, User, ShieldCheck, Sparkles, Activity, Bell, Lock, ArrowRight } from 'lucide-react';
import Logo from './Logo';

/**
 * PortalSelectionLanding Component
 * SmileGuard AI Dental Clinic SaaS Portal Gateway.
 * Pure white + soft lavender aesthetic with tooth visual cues.
 */
export default function PortalSelectionLanding({ onSelectDentistPortal, onSelectPatientPortal }) {
  return (
    <div className="min-h-screen w-screen bg-[#FFFFFF] text-[#263238] flex flex-col justify-between p-6 sm:p-10 font-sans relative overflow-hidden">
      {/* Background Soft Lavender Ambient Lighting */}
      <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-[#F7F5FF] rounded-full blur-3xl pointer-events-none opacity-80" />
      <div className="absolute -bottom-24 right-1/4 w-[500px] h-[500px] bg-[#F0ECFF] rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10">
        <Logo size="md" subtitle="Smarter Insights. Healthier Smiles." />

        <div className="flex items-center gap-2 text-xs font-semibold text-[#667085] bg-[#F7F5FF] px-4 py-2 rounded-full border border-[#E9E5F5] shadow-xs">
          <ShieldCheck className="h-4 w-4 text-[#8B5CF6]" />
          <span>Secure Clinical Workstation • HIPAA Compliant</span>
        </div>
      </header>

      {/* Center Main Hero & Selection Area */}
      <main className="my-auto w-full max-w-4xl mx-auto text-center space-y-8 z-10 py-10">
        {/* Top AI Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0ECFF] border border-[#E9E5F5] text-[#6D5AE6] text-xs font-bold shadow-xs animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
          <span>AI-Powered Dental Intelligence</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-[#263238] tracking-tight leading-tight">
            Smarter Insights. <br />
            <span className="text-[#8B5CF6]">Healthier Smiles.</span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#667085] leading-relaxed">
            SmileGuard AI integrates comprehensive dental clinic management with CNN-powered radiological X-ray analysis — empowering clinicians and providing patients with high-precision oral care.
          </p>
        </div>

        {/* Two Main Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
          {/* Card 1: Dentist & Admin Portal */}
          <div
            onClick={onSelectDentistPortal}
            className="group relative bg-[#FFFFFF] border border-[#E9E5F5] rounded-[24px] p-8 text-left shadow-[0_4px_20px_rgba(100,80,180,0.06)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] hover:border-[#A78BFA] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7F5FF] rounded-full blur-2xl group-hover:bg-[#F0ECFF] transition-colors" />

            <div className="space-y-5">
              <div className="h-14 w-14 rounded-2xl bg-[#F0ECFF] border border-[#E9E5F5] text-[#8B5CF6] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Stethoscope className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] bg-[#F7F5FF] px-2.5 py-1 rounded-md border border-[#E9E5F5]">
                  Clinicians & Staff
                </span>
                <h3 className="text-xl font-bold text-[#263238] group-hover:text-[#8B5CF6] transition-colors mt-2">
                  Dentist Portal
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-medium">
                  Access AI diagnostic workstations, patient records, treatment history, laboratory tracking, and appointment queues.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between text-xs font-bold text-[#8B5CF6] group-hover:text-[#6D5AE6]">
              <span>Sign In to Clinician Workspace</span>
              <div className="h-8 w-8 rounded-full bg-[#F7F5FF] flex items-center justify-center group-hover:bg-[#8B5CF6] group-hover:text-white transition-all">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Patient Portal */}
          <div
            onClick={onSelectPatientPortal}
            className="group relative bg-[#FFFFFF] border border-[#E9E5F5] rounded-[24px] p-8 text-left shadow-[0_4px_20px_rgba(100,80,180,0.06)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] hover:border-[#A78BFA] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7F5FF] rounded-full blur-2xl group-hover:bg-[#F0ECFF] transition-colors" />

            <div className="space-y-5">
              <div className="h-14 w-14 rounded-2xl bg-[#F0ECFF] border border-[#E9E5F5] text-[#8B5CF6] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <User className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  Patients
                </span>
                <h3 className="text-xl font-bold text-[#263238] group-hover:text-[#8B5CF6] transition-colors mt-2">
                  Patient Portal
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-medium">
                  Book dental appointments, review treatment progress, view dental X-rays, and manage clinic notifications.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between text-xs font-bold text-[#8B5CF6] group-hover:text-[#6D5AE6]">
              <span>Sign In to Patient Gateway</span>
              <div className="h-8 w-8 rounded-full bg-[#F7F5FF] flex items-center justify-center group-hover:bg-[#8B5CF6] group-hover:text-white transition-all">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Feature Badges Footer */}
      <footer className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] font-semibold text-[#667085] pt-4 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
          <span>CNN Radiological Diagnostics</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-[#8B5CF6]" />
          <span>Encrypted Patient Records</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-[#8B5CF6]" />
          <span>Real-Time Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-[#8B5CF6]" />
          <span>Treatment Timeline</span>
        </div>
      </footer>
    </div>
  );
}

