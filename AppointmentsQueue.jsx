import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Calendar, User, Phone, Mail } from 'lucide-react';
import { db } from './src/firebase';
import { collection, onSnapshot, query, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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

            fetched.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            setAppointments(fetched);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching clinical appointments queue:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (app, newStatus) => {
        try {
            if (db) {
                const apptRef = doc(db, 'appointments', app.id);
                await updateDoc(apptRef, { status: newStatus, updatedAt: serverTimestamp() });

                if (app.userId) {
                    const isAccepted = newStatus === 'Confirmed' || newStatus === 'Accepted';
                    const title = isAccepted ? 'Appointment Confirmed! ✅' : `Appointment ${newStatus}`;
                    const body = isAccepted
                        ? `Great news! Your reservation for ${app.service || 'dental service'} on ${app.date || ''} at ${app.time || ''} has been accepted by the admin.`
                        : `Your appointment request for ${app.service || 'dental service'} status was updated to ${newStatus}.`;

                    await addDoc(collection(db, 'notifications'), {
                        userId: app.userId,
                        type: 'appointment',
                        title: title,
                        body: body,
                        unread: true,
                        createdAt: serverTimestamp(),
                    });
                }
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
            <div className="flex flex-col items-center justify-center p-12 bg-[#FFFFFF] rounded-[20px] border border-[#E9E5F5] text-[#667085] gap-3">
                <Spinner size="md" className="text-[#8B5CF6]" />
                <span className="text-xs font-bold">Loading Clinical Appointment Queue...</span>
            </div>
        );
    }

    return (
        <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E9E5F5] shadow-[0_4px_20px_rgba(100,80,180,0.06)] overflow-hidden text-left">
            <div className="p-6 border-b border-[#E9E5F5] bg-[#F7F5FF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-[#263238]">Clinical Appointments Queue</h3>
                    <p className="text-xs text-[#667085] font-semibold mt-0.5">
                        Review patient requests, confirm daily slots, and manage clinic schedule.
                    </p>
                </div>

                <div className="flex bg-[#FFFFFF] p-1 rounded-xl border border-[#E9E5F5] self-start sm:self-center shadow-xs">
                    {['All', 'Today', 'Pending'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                filter === tab
                                    ? 'bg-[#F0ECFF] text-[#6D5AE6] shadow-xs'
                                    : 'text-[#667085] hover:text-[#263238]'
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
                        <tr className="border-b border-[#E9E5F5] bg-[#F7F5FF] text-[11px] uppercase tracking-wider font-bold text-[#667085]">
                            <th className="py-4 px-6">Patient Name</th>
                            <th className="py-4 px-4">Service Required</th>
                            <th className="py-4 px-4">Scheduled Slot</th>
                            <th className="py-4 px-4">Target Date</th>
                            <th className="py-4 px-4">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9E5F5] text-xs">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center text-[#667085] font-medium">
                                    No patient appointments match the selected filter.
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((app) => (
                                <tr key={app.id} className="hover:bg-[#F7F5FF]/60 transition-colors group">
                                    <td className="py-4 px-6 font-bold text-[#263238]">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-[#F0ECFF] text-[#6D5AE6] border border-[#E9E5F5] flex items-center justify-center text-xs font-black">
                                                {(app.patientName || app.name || 'P').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#263238]">{app.patientName || app.name || 'Patient'}</p>
                                                <p className="text-[10px] text-[#667085] font-semibold">{app.patientEmail || app.patientPhone || ''}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 font-bold text-[#263238]">{app.service}</td>

                                    <td className="py-4 px-4 text-[#667085] font-medium">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" />
                                            {app.time}
                                        </div>
                                    </td>

                                    <td className="py-4 px-4 text-[#263238] font-bold text-xs">{app.date}</td>

                                    <td className="py-4 px-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                                                app.status === 'Confirmed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : app.status === 'Rejected' || app.status === 'Cancelled'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : 'bg-[#F0ECFF] text-[#6D5AE6] border-[#E9E5F5]'
                                            }`}
                                        >
                                            {app.status || 'Pending'}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {app.status !== 'Confirmed' && (
                                                <button
                                                    onClick={() => updateStatus(app, 'Confirmed')}
                                                    className="px-3 py-1.5 rounded-[9px] bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    <span>Confirm</span>
                                                </button>
                                            )}
                                            {app.status !== 'Rejected' && app.status !== 'Cancelled' && (
                                                <button
                                                    onClick={() => updateStatus(app, 'Rejected')}
                                                    className="px-3 py-1.5 rounded-[9px] border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-all"
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

