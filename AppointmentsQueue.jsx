import React, { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';

export default function AppointmentsQueue() {
    const [filter, setFilter] = useState('All');

    const [appointments, setAppointments] = useState([
        { id: 1, name: 'Juan dela Cruz', service: 'Routine Check-up', time: '09:00 AM', date: 'Today', status: 'Confirmed' },
        { id: 2, name: 'Ana Reyes', service: 'Tooth Extraction', time: '11:30 AM', date: 'Today', status: 'Pending' },
        { id: 3, name: 'Carlo Mendoza', service: 'AI Diagnostic Scan', time: '02:00 PM', date: 'Today', status: 'Confirmed' },
        { id: 4, name: 'Maria Santos', service: 'Braces Adjustment', time: '10:00 AM', date: 'Tomorrow', status: 'Confirmed' },
        { id: 5, name: 'Liza Ramos', service: 'Teeth Whitening', time: '04:15 PM', date: 'Jun 27, 2026', status: 'Pending' },
    ]);

    const updateStatus = (id, newStatus) => {
        setAppointments((prev) =>
            prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
    };

    const filteredAppointments = appointments.filter((app) => {
        if (filter === 'Today') return app.date === 'Today';
        if (filter === 'Pending') return app.status === 'Pending';
        return true;
    });

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-500 font-medium">
                        Review incoming requests and manage daily clinical slots.
                    </p>
                </div>

                <div className="flex bg-slate-200/70 p-1 rounded-lg self-start sm:self-center">
                    {['All', 'Today', 'Pending'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === tab
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                            <th className="py-4 px-6">Patient Name</th>
                            <th className="py-4 px-4">Service Required</th>
                            <th className="py-4 px-4">Scheduled Slot</th>
                            <th className="py-4 px-4">Date</th>
                            <th className="py-4 px-4">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                                    No appointments match the selected filter.
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors group">
                                    <td className="py-4 px-6 font-bold text-slate-900">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-semibold">
                                                {app.name.charAt(0)}
                                            </div>
                                            {app.name}
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 font-medium text-slate-600">{app.service}</td>

                                    <td className="py-4 px-4 text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            {app.time}
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 text-slate-600 font-medium text-xs">{app.date}</td>

                                    <td className="py-4 px-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${app.status === 'Confirmed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : app.status === 'Rejected'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                                }`}
                                        >
                                            {app.status}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        {app.status === 'Pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => updateStatus(app.id, 'Confirmed')}
                                                    className="h-8 w-8 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all rounded-lg flex items-center justify-center shadow-sm"
                                                    title="Accept Appointment"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(app.id, 'Rejected')}
                                                    className="h-8 w-8 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white transition-all rounded-lg flex items-center justify-center shadow-sm"
                                                    title="Reject Appointment"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic font-medium pr-2">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
