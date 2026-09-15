import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  Scan,
  ShieldCheck,
  Settings,
  LogOut,
  Moon,
  Sun,
  FlaskConical,
  Menu,
  X,
} from 'lucide-react';

import Logo from '../auth/Logo';
import DentistDashboard from '../../DentistDashboard';
import AiDiagnostic from '../../../AiDiagnostic';
import AppointmentsQueue from '../../../AppointmentsQueue';
import BracesMonitoring from '../../BracesMonitoring';
import AdminUserManagement from './AdminUserManagement';
import AdminClinicSettings from './AdminClinicSettings';
import LaboratoryTracking from './LaboratoryTracking';
import PurpleWaveBackground from '../common/PurpleWaveBackground';

/**
 * Top-Level Admin & Clinician Portal for SmileGuard AI.
 * Wrapped in luminous PurpleWaveBackground with glassmorphic sidebar and workspace.
 */
export default function AdminPortal({ adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('smileguard_theme') === 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smileguard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smileguard_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Patient Directory', icon: Users },
    { name: 'AI Diagnostic', icon: Scan },
    { name: 'Appointments Queue', icon: Calendar },
    { name: 'Treatment Monitoring', icon: Activity },
    { name: 'Laboratory Tracking', icon: FlaskConical },
    { name: 'Clinic Settings & Security', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DentistDashboard />;
      case 'Patient Directory':
        return <AdminUserManagement />;
      case 'AI Diagnostic':
        return <AiDiagnostic />;
      case 'Appointments Queue':
        return <AppointmentsQueue />;
      case 'Treatment Monitoring':
        return <BracesMonitoring />;
      case 'Laboratory Tracking':
        return <LaboratoryTracking />;
      case 'Clinic Settings & Security':
        return <AdminClinicSettings />;
      default:
        return <DentistDashboard />;
    }
  };

  const adminName = adminUser?.displayName || adminUser?.email || 'Dr. Ana Santos';
  const adminInitials = adminName.substring(0, 2).toUpperCase();

  return (
    <PurpleWaveBackground>
      <div className="flex h-screen w-screen overflow-hidden font-sans relative">
        {/* Mobile Menu Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-[#263238]/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900/95 backdrop-blur-xl flex flex-col justify-between text-[#263238] dark:text-white shadow-2xl z-50 border-r border-[#E9E5F5] dark:border-slate-800">
              <div>
                <div className="p-5 border-b border-[#E9E5F5] dark:border-slate-800 flex items-center justify-between bg-[#F7F5FF] dark:bg-slate-950/60">
                  <Logo size="sm" subtitle="Clinician Portal" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#667085] dark:text-slate-300 hover:bg-[#F0ECFF] dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="p-3 space-y-1 text-left">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setActiveTab(item.name);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#F0ECFF] dark:bg-indigo-600/20 text-[#6D5AE6] dark:text-indigo-300 border border-transparent dark:border-indigo-500/30 shadow-xs'
                            : 'text-[#667085] dark:text-slate-400 hover:bg-[#F7F5FF] dark:hover:bg-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#8B5CF6] dark:text-indigo-400' : 'text-[#667085] dark:text-slate-400'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-3 border-t border-[#E9E5F5] dark:border-slate-800 bg-[#F7F5FF] dark:bg-slate-950/60">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Sign Out Admin Session</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Admin Sidebar Navigation */}
        <aside className="hidden md:flex w-64 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl flex-col justify-between text-[#263238] dark:text-white shrink-0 border-r border-[#E9E5F5] dark:border-slate-800 shadow-xs z-20">
          <div>
            {/* Brand Header */}
            <div className="p-6 border-b border-[#E9E5F5] dark:border-slate-800 bg-[#F7F5FF]/50 dark:bg-slate-950/40">
              <Logo size="md" subtitle="Clinician Workspace" />
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-1.5 text-left">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-xs font-bold transition-all group ${
                      isActive
                        ? 'bg-[#F0ECFF] dark:bg-indigo-600/20 text-[#6D5AE6] dark:text-indigo-300 shadow-xs border border-[#E9E5F5] dark:border-indigo-500/30'
                        : 'text-[#667085] dark:text-slate-400 hover:bg-[#F7F5FF] dark:hover:bg-slate-800/70 hover:text-[#263238] dark:hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#8B5CF6] dark:text-indigo-400' : 'text-[#667085] dark:text-slate-400 group-hover:text-indigo-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer User Card */}
          <div className="flex flex-col border-t border-[#E9E5F5] dark:border-slate-800 bg-[#F7F5FF]/50 dark:bg-slate-950/40 text-left">
            <div className="p-4 flex items-center gap-3 border-b border-[#E9E5F5] dark:border-slate-800">
              <div className="h-9 w-9 rounded-full bg-[#F0ECFF] dark:bg-indigo-600/20 border border-[#E9E5F5] dark:border-indigo-500/30 flex items-center justify-center text-[#6D5AE6] dark:text-indigo-300 text-xs font-black shrink-0">
                {adminInitials}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#263238] dark:text-white truncate">{adminName}</p>
                <p className="text-[10px] text-[#6D5AE6] dark:text-indigo-300 font-semibold truncate flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 shrink-0 text-[#8B5CF6] dark:text-indigo-400" />
                  <span>Dentist • Clinician</span>
                </p>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out Admin Session</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/60 dark:bg-transparent backdrop-blur-md z-10">
          {/* Top Header Bar */}
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-[#E9E5F5] dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-xs shrink-0 z-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl bg-[#F7F5FF] dark:bg-slate-800 text-[#263238] dark:text-white md:hidden hover:bg-[#F0ECFF] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-xs sm:text-sm font-black text-[#263238] dark:text-white tracking-wide uppercase truncate">
                {activeTab}
              </h2>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold bg-[#F7F5FF] dark:bg-slate-800/80 border border-[#E9E5F5] dark:border-slate-700/60 text-[#6D5AE6] dark:text-indigo-300 px-3 py-1 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                <span>Dental Clinic Workstation • Encrypted</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 rounded-full bg-[#F0ECFF] dark:bg-indigo-600/20 text-[#6D5AE6] dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-[#E9E5F5] dark:border-indigo-500/30">
                  {adminInitials}
                </div>
                <span className="hidden md:inline text-xs font-bold text-[#263238] dark:text-white">
                  {adminName}
                </span>
              </div>
            </div>
          </header>

          {/* Dynamic Tab Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent pb-20 md:pb-8">
            {renderContent()}
          </main>

          {/* Mobile Bottom Navigation Bar (< 768px touch-friendly PWA) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-[#E9E5F5] dark:border-slate-800 flex items-center justify-around px-2 z-40 shadow-lg pb-safe">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                    isActive ? 'text-[#6D5AE6] dark:text-indigo-300 bg-[#F0ECFF] dark:bg-indigo-600/20 font-bold' : 'text-[#667085] dark:text-slate-400'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#8B5CF6] dark:text-indigo-400' : 'text-[#667085] dark:text-slate-400'}`} />
                  <span className="text-[9px] truncate max-w-[56px]">{item.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PurpleWaveBackground>
  );
}


