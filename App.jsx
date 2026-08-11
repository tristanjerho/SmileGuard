import React, { useState, useEffect, useRef } from 'react';
import {
    UserCircle,
    Calendar,
    Activity,
    Bell,
    LogOut,
    Shield,
} from 'lucide-react';
import { auth, db } from './src/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import AiDiagnostic from './AiDiagnostic';
import AppointmentsQueue from './AppointmentsQueue';
import BookAppointment from './BookAppointment';
import DentistDashboard from './src/DentistDashboard';
import PatientProfileCard from './src/PatientProfileCard';
import PatientTreatmentHistory from './src/PatientTreatmentHistory';
import PatientNotifications from './src/PatientNotifications';
import MyAppointments from './src/MyAppointments';
import PatientLoginPage from './src/components/auth/PatientLoginPage';
import AdminLoginPage from './src/components/admin/AdminLoginPage';
import AdminPortal from './src/components/admin/AdminPortal';
import PortalSelectionLanding from './src/components/auth/PortalSelectionLanding';
import OnboardingFormPage from './src/components/auth/OnboardingFormPage';
import { syncUserWithFirestore } from './src/services/userService';
import Spinner from './src/components/auth/Spinner';

function AppContent() {
    const { currentUser, userProfile, loading, onboardingCompleted, isAdmin, logout, refreshProfile } = useAuth();
    const [userType, setUserType] = useState('landing');
    const [activeTab, setActiveTab] = useState('My Profile');

    const userTypeRef = useRef(userType);
    useEffect(() => {
        userTypeRef.current = userType;
    }, [userType]);

    // Keep userType synced with auth state changes
    useEffect(() => {
        if (currentUser) {
            if (isAdmin || userTypeRef.current === 'admin' || userTypeRef.current === 'admin_login') {
                setUserType('admin');
            } else {
                setUserType('patient');
            }
        }
    }, [currentUser, isAdmin]);

    const navigationItems = [
        { name: 'My Profile', icon: UserCircle },
        { name: 'Book Appointment', icon: Calendar },
        { name: 'My Appointments', icon: Calendar },
        { name: 'Treatment History', icon: Activity },
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

    const handleLogout = async () => {
        await logout();
        setUserType('landing');
    };

    if (loading) {
        return (
            <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
                <Spinner size="lg" className="text-teal-400" />
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Initializing SmileGuard AI Workspace...
                </p>
            </div>
        );
    }

    // Render Portal Selection Landing Page
    if (!currentUser && userType === 'landing') {
        return (
            <PortalSelectionLanding
                onSelectDentistPortal={() => setUserType('admin_login')}
                onSelectPatientPortal={() => setUserType('patient_login')}
            />
        );
    }

    // Render Admin / Dentist Login Page
    if (!currentUser && userType === 'admin_login') {
        return (
            <AdminLoginPage
                onAdminAuthenticated={() => {
                    setUserType('admin');
                    setActiveTab('Dashboard');
                }}
                onSwitchToPatientPortal={() => setUserType('landing')}
            />
        );
    }

    // Render Patient Login Gateway
    if (!currentUser && userType === 'patient_login') {
        return (
            <PatientLoginPage
                onAuthenticated={() => {
                    setUserType('patient');
                    setActiveTab('My Profile');
                }}
                onCancel={() => setUserType('landing')}
            />
        );
    }

    // Render Admin Workspace (for Dentist/Admin accounts)
    if (currentUser && (userType === 'admin' || isAdmin)) {
        return <AdminPortal adminUser={currentUser} onLogout={handleLogout} />;
    }

    // MANDATORY ONBOARDING FLOW FOR PATIENTS:
    // If logged in as patient but onboarding is incomplete, block workspace and render OnboardingFormPage
    if (currentUser && !isAdmin && !onboardingCompleted) {
        return (
            <OnboardingFormPage
                onCompleted={async () => {
                    await refreshProfile();
                    setUserType('patient');
                    setActiveTab('My Profile');
                }}
            />
        );
    }

    // Render Patient Workspace
    return (
        <div className="flex h-screen w-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
            <aside className="w-64 bg-[#0B132B] flex flex-col justify-between text-slate-300 shrink-0 shadow-xl">
                <div>
                    <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-400 flex items-center justify-center text-slate-900 font-black text-sm">
                            SG
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            SmileGuard <span className="text-emerald-400">AI</span>
                        </span>
                    </div>

                    <nav className="p-4 space-y-1 text-left">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.name;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setActiveTab(item.name)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all group ${
                                        isActive
                                            ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/10'
                                            : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex flex-col border-t border-slate-800/60 bg-[#080d1e] text-left">
                    <div className="p-4 flex items-center gap-3 border-b border-slate-800/40">
                        <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-slate-600">
                            {userProfile?.fullName
                                ? userProfile.fullName.substring(0, 2).toUpperCase()
                                : (currentUser?.displayName
                                    ? currentUser.displayName.substring(0, 2).toUpperCase()
                                    : (currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : 'MS'))}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">
                                {userProfile?.fullName || currentUser?.displayName || currentUser?.email || 'Maria Santos'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                                {currentUser?.email || 'Patient User'}
                            </p>
                        </div>
                    </div>

                    <div className="p-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold text-rose-400/90 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Sign Out of Session
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
                    <h2 className="text-sm font-black text-slate-900 tracking-wide uppercase">{activeTab}</h2>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (isAdmin) {
                                    setUserType('admin');
                                } else {
                                    setUserType('admin_login');
                                }
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-100 transition-colors"
                        >
                            <Shield className="h-3.5 w-3.5" />
                            <span>Switch to Admin Portal</span>
                        </button>
                        <div className="flex items-center gap-2 text-[11px] font-bold bg-slate-50 border border-slate-200/60 text-slate-500 px-3 py-1.5 rounded-lg">
                            <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                            <span>Patient View Mode</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
