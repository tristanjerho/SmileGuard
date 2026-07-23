import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Activity,
    Scan,
    UserCircle,
    Bell,
    LogOut,
} from 'lucide-react';

import AiDiagnostic from './AiDiagnostic';
import AppointmentsQueue from './AppointmentsQueue';
import BookAppointment from './BookAppointment';
import DentistDashboard from './src/DentistDashboard';
import PatientProfile from './src/PatientProfile';
import TreatmentHistory from './src/TreatmentHistory';
import PatientRecords from './src/PatientRecords';
import BracesMonitoring from './src/BracesMonitoring';
import NotificationsStream from './src/NotificationsStream';
import MyAppointments from './src/MyAppointments';
import PatientProfileCard from './src/PatientProfileCard';
import PatientTreatmentHistory from './src/PatientTreatmentHistory';
import PatientNotifications from './src/PatientNotifications';

export default function App() {
    const [userType, setUserType] = useState('landing');
    const [activeTab, setActiveTab] = useState('Dashboard');

    const navigationItems = userType === 'dentist'
        ? [
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Patient Records', icon: Users },
            { name: 'Appointments', icon: Calendar },
            { name: 'Braces Monitoring', icon: Activity },
            { name: 'AI Diagnostic', icon: Scan },
        ]
        : [
            { name: 'My Profile', icon: UserCircle },
            { name: 'Book Appointment', icon: Calendar },
            { name: 'My Appointments', icon: Calendar },
            { name: 'Treatment History', icon: Activity },
            { name: 'Notifications', icon: Bell },
        ];

    const renderContent = () => {
        if (userType === 'dentist') {
            switch (activeTab) {
                case 'Dashboard':
                    return <DentistDashboard />;
                case 'AI Diagnostic':
                    return <AiDiagnostic />;
                case 'Appointments':
                    return <AppointmentsQueue />;
                case 'Patient Records':
                    return <PatientRecords />;
                case 'Braces Monitoring':
                    return <BracesMonitoring />;
                default:
                    return (
                        <div className="bg-white p-8 border border-slate-200 rounded-xl text-center text-slate-400">
                            <p className="font-medium">
                                Panel coming soon: <span className="font-bold text-slate-700">{activeTab}</span>
                            </p>
                        </div>
                    );
            }
        }

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
                return (
                    <div className="bg-white p-8 border border-slate-200 rounded-xl text-center text-slate-400">
                        <p className="font-medium">
                            Panel coming soon: <span className="font-bold text-slate-700">{activeTab}</span>
                        </p>
                    </div>
                );
        }
    };

    const handleLogin = (portalType) => {
        setUserType(portalType);
        setActiveTab(portalType === 'dentist' ? 'Dashboard' : 'My Profile');
    };

    const handleLogout = () => {
        setUserType('landing');
    };

    if (userType === 'landing') {
        return (
            <div className="min-h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="max-w-md w-full text-center space-y-8 z-10">
                    <div className="space-y-3">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-400 flex items-center justify-center text-slate-950 text-2xl font-black mx-auto shadow-xl shadow-emerald-400/20">
                            SG
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            SmileGuard <span className="text-emerald-400">AI</span>
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">
                            Next-generation dental workspace & diagnostic platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                        <button
                            onClick={() => handleLogin('dentist')}
                            className="group p-5 bg-slate-800/60 border border-slate-700 hover:border-emerald-400 rounded-xl text-left transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-lg"
                        >
                            <h3 className="text-white font-bold text-base group-hover:text-emerald-400 transition-colors">
                                Dentist Portal &rarr;
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                                Access clinical patient charts, monitor braces milestones, and review CNN-powered dental X-ray scans.
                            </p>
                        </button>

                        <button
                            onClick={() => handleLogin('patient')}
                            className="group p-5 bg-slate-800/60 border border-slate-700 hover:border-[#008B8B] rounded-xl text-left transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-lg"
                        >
                            <h3 className="text-white font-bold text-base group-hover:text-teal-400 transition-colors">
                                Patient Portal &rarr;
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                                Book dynamic treatment slots, view orthodontic milestone statuses, and access your profile history logs.
                            </p>
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase pt-6">
                        Secure HIPAA Compliant Dental Workspace Environment
                    </div>
                </div>
            </div>
        );
    }

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

                    <nav className="p-4 space-y-1">
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

                <div className="flex flex-col border-t border-slate-800/60 bg-[#080d1e]">
                    <div className="p-4 flex items-center gap-3 border-b border-slate-800/40">
                        <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-slate-600">
                            {userType === 'dentist' ? 'AS' : 'MS'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">
                                {userType === 'dentist' ? 'Dr. Ana Santos' : 'Maria Santos'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                                {userType === 'dentist' ? 'Clinician Admin' : 'Patient ID #10024'}
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

                    <div className="flex items-center gap-3 text-[11px] font-bold bg-slate-50 border border-slate-200/60 text-slate-500 px-3 py-1.5 rounded-lg">
                        <div className={`h-1.5 w-1.5 rounded-full ${userType === 'dentist' ? 'bg-emerald-400' : 'bg-teal-400'}`} />
                        <span className="capitalize">{userType} View Mode</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
