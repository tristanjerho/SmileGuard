import React from 'react';
import { Calendar, Users, Scan, Activity, TrendingUp } from 'lucide-react';

export default function DentistDashboard() {
    const stats = [
        { label: "Today's Appointments", value: '6', subtext: '2 pending approval', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Total Patients', value: '148', subtext: '+3 new this week', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'AI Scans Done', value: '23', subtext: 'This month', icon: Scan, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Braces Cases', value: '12', subtext: 'Active treatment', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    const upcomingAppointments = [
        { name: 'Maria Santos', type: 'Check-up', time: '09:00 AM', status: 'confirmed', initial: 'MS' },
        { name: 'Juan dela Cruz', type: 'Cleaning', time: '10:30 AM', status: 'confirmed', initial: 'JC' },
        { name: 'Ana Reyes', type: 'Extraction', time: '01:30 PM', status: 'pending', initial: 'AR' },
        { name: 'Carlo Mendoza', type: 'AI Scan', time: '03:00 PM', status: 'confirmed', initial: 'CM' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Good morning, Dr. Santos 👋
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Here's what's happening at your clinic today — June 25, 2026</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-3xl font-bold tracking-tight text-slate-800">{stat.value}</p>
                                <p className="text-xs text-slate-500 font-medium">{stat.subtext}</p>
                            </div>
                            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">Monthly Visit Trend</h3>
                                <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <TrendingUp className="h-3 w-3" /> +12%
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Jan - Jun 2026</span>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                            <svg className="w-full h-32 text-emerald-400" viewBox="0 0 600 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M 10 80 Q 120 50 230 65 T 450 20 T 590 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 10 80 Q 120 50 230 65 T 450 20 T 590 10 L 590 100 L 10 100 Z" fill="url(#gradient)" opacity="0.08" />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="currentColor" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-3 border-t border-slate-100 pt-2 px-1">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Diagnosis Breakdown</h3>
                        <div className="space-y-2">
                            {[
                                { name: 'Cavities', pct: '34%', color: 'bg-emerald-400' },
                                { name: 'Cleaning', pct: '28%', color: 'bg-sky-400' },
                                { name: 'Braces', pct: '18%', color: 'bg-indigo-400' },
                                { name: 'Root Canal', pct: '12%', color: 'bg-purple-400' },
                                { name: 'Other', pct: '8%', color: 'bg-amber-400' },
                            ].map((item, i) => (
                                <div key={i} className="py-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                                        <span className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${item.color}`} />
                                            {item.name}
                                        </span>
                                        <span className="font-bold text-slate-700">{item.pct}</span>
                                    </div>
                                    <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className={`${item.color} h-full rounded-full`} style={{ width: item.pct }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900">Today's Schedule</h3>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">June 25</span>
                        </div>

                        <div className="space-y-2">
                            {upcomingAppointments.map((app, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                                            {app.initial}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">{app.name}</p>
                                            <p className="text-[10px] text-slate-400">{app.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold text-slate-500">{app.time}</p>
                                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="mt-6 w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                        View Complete Timeline Calendar
                    </button>
                </div>
            </div>
        </div>
    );
}
