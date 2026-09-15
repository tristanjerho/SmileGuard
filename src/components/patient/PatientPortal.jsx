import React, { useState } from 'react';
import {
  UserCircle,
  Calendar,
  Activity,
  Bell,
  LogOut,
  Shield,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  Clock,
  HeartPulse,
  PlusCircle,
  Sparkles
} from 'lucide-react';

import Logo from '../auth/Logo';
import PatientProfileCard from '../../PatientProfileCard';
import BookAppointment from '../../../BookAppointment';
import MyAppointments from '../../MyAppointments';
import PatientTreatmentHistory from '../../PatientTreatmentHistory';
import PatientNotifications from '../../PatientNotifications';

/**
 * Top-Level Patient Portal Component for SmileGuard AI.
 * Premium, dental-focused SaaS workstation matching the Admin Portal visual architecture.
 */
export default function PatientPortal({ patientUser, userProfile, onLogout, onSwitchToAdmin }) {
  const [activeTab, setActiveTab] = useState('My Profile');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('smileguard_theme') === 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    { name: 'My Profile', icon: UserCircle },
    { name: 'Book Appointment', icon: PlusCircle },
    { name: 'My Appointments', icon: Clock },
    { name: 'Treatment History', icon: HeartPulse },
    { name: 'Notifications', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'My Profile':
        return <PatientProfileCard />;
      case 'Book Appointment':
        return <BookAppointment />;
      case 'My Appointments':
        return <MyAppointments />;
      case 'Treatment History':
        return <PatientTreatmentHistory />;
      case 'Notifications':
        return <PatientNotifications />;
      default:
        return <PatientProfileCard />;
    }
  };

  const defaultPatientName = patientUser?.displayName || patientUser?.email?.split('@')[0] || 'Patient User';
  const patientName =
    userProfile?.fullName ||
    `${userProfile?.FirstName || ''} ${userProfile?.lastName || ''}`.trim() ||
    defaultPatientName;

  const patientInitials = patientName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const patientEmail = userProfile?.email || patientUser?.email || '';

  return (
    <div className="flex h-screen w-screen bg-[#FFFFFF] text-[#263238] overflow-hidden font-sans">
      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#263238]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#FFFFFF] flex flex-col justify-between text-[#263238] shadow-2xl z-50 border-r border-[#E9E5F5]">
            <div>
              <div className="p-5 border-b border-[#E9E5F5] flex items-center justify-between bg-[#F7F5FF]">
                <Logo size="sm" subtitle="Patient Portal" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F0ECFF]"
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
                          ? 'bg-[#F0ECFF] text-[#6D5AE6] shadow-xs'
                          : 'text-[#667085] hover:bg-[#F7F5FF] hover:text-[#263238]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#8B5CF6]' : 'text-[#667085]'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 border-t border-[#E9E5F5] bg-[#F7F5FF]">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out Patient Session</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-[#FFFFFF] flex-col justify-between text-[#263238] shrink-0 border-r border-[#E9E5F5] shadow-xs">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#E9E5F5] bg-[#F7F5FF]">
            <Logo size="md" subtitle="Patient Workspace" />
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
                      ? 'bg-[#F0ECFF] text-[#6D5AE6] shadow-xs border border-[#E9E5F5]'
                      : 'text-[#667085] hover:bg-[#F7F5FF] hover:text-[#263238]'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#8B5CF6]' : 'text-[#667085] group-hover:text-[#8B5CF6]'
                    }`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="flex flex-col border-t border-[#E9E5F5] bg-[#F7F5FF] text-left">
          <div className="p-4 flex items-center gap-3 border-b border-[#E9E5F5]">
            <div className="h-9 w-9 rounded-full bg-[#F0ECFF] border border-[#E9E5F5] flex items-center justify-center text-[#6D5AE6] text-xs font-black shrink-0">
              {patientInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#263238] truncate">{patientName}</p>
              <p className="text-[10px] text-[#667085] font-semibold truncate">{patientEmail}</p>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E9E5F5] px-4 sm:px-8 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#F7F5FF] text-[#263238] md:hidden hover:bg-[#F0ECFF] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xs sm:text-sm font-black text-[#263238] tracking-wide uppercase truncate">
              {activeTab}
            </h2>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold bg-[#F7F5FF] border border-[#E9E5F5] text-[#6D5AE6] px-3 py-1 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>Patient Care Portal • Encrypted</span>
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl bg-[#F7F5FF] text-[#667085] hover:bg-[#F0ECFF] transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-[#263238]" />}
            </button>

            <div className="h-8 w-[1px] bg-[#E9E5F5] mx-0.5 sm:mx-1" />

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 rounded-full bg-[#F0ECFF] text-[#6D5AE6] font-bold text-xs flex items-center justify-center border border-[#E9E5F5]">
                {patientInitials}
              </div>
              <span className="hidden md:inline text-xs font-bold text-[#263238]">
                {patientName}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FFFFFF] pb-20 md:pb-8">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation Bar (< 768px touch-friendly) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FFFFFF] border-t border-[#E9E5F5] flex items-center justify-around px-2 z-40 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${
                  isActive ? 'text-[#6D5AE6] bg-[#F0ECFF] font-bold' : 'text-[#667085]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#8B5CF6]' : 'text-[#667085]'}`} />
                <span className="text-[10px]">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
