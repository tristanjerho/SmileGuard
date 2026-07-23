import React from 'react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Activity,
    Scan,
    UserCircle,
    Bell,
} from 'lucide-react';

export default function AppShell({
    children,
    userType = 'dentist',
    activeTab = 'Dashboard',
    onTabChange,
    onUserToggle,
}) {
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

    return (
        <div className="flex h-screen w-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
            <aside className="w-64 bg-[#0B132B] flex flex-col justify-between text-slate-300 shrink-0">
                <div>
                    <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-400 flex items-center justify-center text-slate-900 font-bold">
                            SG
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
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
                                    onClick={() => onTabChange?.(item.name)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${isActive
                                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/10'
                                        : 'hover:bg-slate-800/60 hover:text-white'
                                        }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'}`}
                                    />
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-700/50 bg-[#080d1e] flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white border border-slate-600">
                        {userType === 'dentist' ? 'AS' : 'MS'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                            {userType === 'dentist' ? 'Dr. Ana Santos' : 'Maria Santos'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {userType === 'dentist' ? 'Clinician Admin' : 'Patient ID #10024'}
                        </p>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
                    <h1 className="text-xl font-bold text-slate-900">{activeTab}</h1>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => onUserToggle?.('dentist')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${userType === 'dentist' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Dentist View
                            </button>
                            <button
                                onClick={() => onUserToggle?.('patient')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${userType === 'patient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Patient View
                            </button>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                        </button>
                        <hr className="w-px h-6 bg-slate-200" />
                        <span className="text-sm text-slate-500 font-medium">Dental Workspace</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
                    {children || (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl h-full flex items-center justify-center text-slate-400">
                            Content container placeholder for: {activeTab}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
