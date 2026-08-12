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

import DentistDashboard from '../../DentistDashboard';
import AiDiagnostic from '../../../AiDiagnostic';
import AppointmentsQueue from '../../../AppointmentsQueue';
import BracesMonitoring from '../../BracesMonitoring';
import AdminUserManagement from './AdminUserManagement';
import AdminClinicSettings from './AdminClinicSettings';
import LaboratoryTracking from './LaboratoryTracking';

/**
 * Top-Level Admin & Clinician Portal for SmileGuard AI.
 * Provides complete workspace management for clinic administrators and dentists.
 */
export default function AdminPortal({ adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
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
    <div className="flex h-screen w-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#0B132B] dark:bg-slate-900 flex flex-col justify-between text-slate-300 shadow-2xl z-50 border-r border-slate-800">
            <div>
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-teal-400 flex items-center justify-center text-white font-black text-xs">
                    SG
                  </div>
                  <span className="text-base font-bold text-white">SmileGuard AI</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 border-t border-slate-800 bg-[#080d1e] dark:bg-slate-950">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out Admin Session</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Admin Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-[#0B132B] dark:bg-slate-900 flex-col justify-between text-slate-300 shrink-0 shadow-2xl border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/20 ring-2 ring-white/10">
              SG
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                SmileGuard <span className="text-purple-400">AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1">
                Admin Workspace
              </span>
            </div>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/40'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="flex flex-col border-t border-slate-800/80 bg-[#080d1e] dark:bg-slate-950 text-left">
          <div className="p-4 flex items-center gap-3 border-b border-slate-800/60">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
              {adminInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-purple-300 font-semibold truncate flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 shrink-0 text-purple-400" />
                <span>Clinician Administrator</span>
              </p>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out Admin Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-sm shrink-0 transition-colors">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 md:hidden hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wide uppercase truncate">
              {activeTab}
            </h2>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span>Clinic Admin Mode • HIPAA Encrypted</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1" />

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-300 dark:border-purple-800">
                {adminInitials}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-800 dark:text-slate-200">
                {adminName}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
