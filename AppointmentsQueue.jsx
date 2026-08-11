import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Calendar, User, Phone, Mail } from 'lucide-react';
import { db } from './src/firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import Spinner from './src/components/auth/Spinner';

export default function AppointmentsQueue() {
    const [filter, setFilter] = useState('All');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'appointments'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = [];
            snapshot.forEach((docSnap) => {
                fetched.push({ id: docSnap.id, ...docSnap.data() });
            });

            // Sort by date / creation time
            fetched.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            setAppointments(fetched);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching clinical appointments queue:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            if (db) {
                const apptRef = doc(db, 'appointments', id);
                await updateDoc(apptRef, { status: newStatus });
            }
        } catch (err) {
            console.error('Error updating appointment status:', err);
            alert('Failed to update status.');
        }
    };

    const filteredAppointments = appointments.filter((app) => {
        if (filter === 'Today') {
            const todayStr = new Date().toISOString().split('T')[0];
            return app.date === todayStr || app.date === 'Today';
        }
        if (filter === 'Pending') return app.status === 'Pending';
        return true;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500 gap-3">
                <Spinner size="md" className="text-purple-600" />
                <span className="text-xs font-bold">Loading Clinical Appointment Queue...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Clinical Appointment Queue</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Review incoming patient requests and confirm daily treatment slots in real-time.
                    </p>
                </div>

                <div className="flex bg-slate-200/70 p-1 rounded-lg self-start sm:self-center">
                    {['All', 'Today', 'Pending'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                filter === tab
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
                            <th className="py-4 px-4">Target Date</th>
                            <th className="py-4 px-4">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                                    No patient appointments match the selected filter.
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors group">
                                    <td className="py-4 px-6 font-bold text-slate-900">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">
                                                {(app.patientName || app.name || 'P').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{app.patientName || app.name || 'Patient'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{app.patientEmail || app.patientPhone || ''}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 font-bold text-slate-800">{app.service}</td>

                                    <td className="py-4 px-4 text-slate-600 font-medium">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            {app.time}
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 text-slate-600 font-bold text-xs">{app.date}</td>

                                    <td className="py-4 px-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                app.status === 'Confirmed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : app.status === 'Rejected' || app.status === 'Cancelled'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                            }`}
                                        >
                                            {app.status || 'Pending'}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {app.status !== 'Confirmed' && (
                                                <button
                                                    onClick={() => updateStatus(app.id, 'Confirmed')}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    <span>Confirm</span>
                                                </button>
                                            )}
                                            {app.status !== 'Rejected' && app.status !== 'Cancelled' && (
                                                <button
                                                    onClick={() => updateStatus(app.id, 'Rejected')}
                                                    className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-all"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    <span>Reject</span>
                                                </button>
                                            )}
                                        </div>
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
