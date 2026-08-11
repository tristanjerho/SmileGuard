import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, XCircle, Edit3, CheckCircle } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';
import Spinner from './components/auth/Spinner';

export default function MyAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Reschedule Modal State
  const [editingAppt, setEditingAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by date descending
      fetched.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setAppointments(fetched);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching patient appointments:', err);
      setErrorMsg('Failed to load appointments from Firestore.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      if (db) {
        const apptRef = doc(db, 'appointments', apptId);
        await updateDoc(apptRef, { status: 'Cancelled' });
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment.');
    }
  };

  const handleOpenReschedule = (appt) => {
    setEditingAppt(appt);
    setNewDate(appt.date || '');
    setNewTime(appt.time || '09:00 AM');
  };

  const handleSaveReschedule = async () => {
    if (!editingAppt || !newDate) return;
    setIsSaving(true);
    try {
      if (db) {
        const apptRef = doc(db, 'appointments', editingAppt.id);
        await updateDoc(apptRef, {
          date: newDate,
          time: newTime,
          status: 'Pending',
        });
      }
      setEditingAppt(null);
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      alert('Failed to update appointment schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-500 gap-3">
        <Spinner size="md" className="text-teal-600" />
        <span className="text-xs font-semibold">Loading your real-time appointments...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">My Appointments</h3>
            <p className="mt-0.5 text-xs text-slate-500">Your personal clinical care schedule synced live with Firestore</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            {appointments.length} {appointments.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold border-b border-red-100">
          {errorMsg}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-medium space-y-2">
          <Calendar className="h-10 w-10 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-600">No appointments scheduled yet.</p>
          <p className="text-xs text-slate-400">Use the "Book Appointment" menu to schedule a visit with Dr. Ana Santos.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3.5">Appointment ID</th>
                <th className="px-4 py-3.5">Service Type</th>
                <th className="px-4 py-3.5">Provider</th>
                <th className="px-4 py-3.5">Scheduled Date</th>
                <th className="px-4 py-3.5">Time Slot</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {appointments.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-500">
                    {row.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-800">{row.service}</td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {row.doctor || 'Dr. Ana Santos'}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {row.date}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {row.time}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        row.status === 'Confirmed'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : row.status === 'Cancelled'
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700 animate-pulse'
                      }`}
                    >
                      {row.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.status !== 'Cancelled' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenReschedule(row)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-all flex items-center gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(row.id)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 italic">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reschedule Modal */}
      {editingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
            <p className="text-xs text-slate-500">
              Select a new date and time for <span className="font-semibold text-slate-700">{editingAppt.service}</span>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAppt(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveReschedule}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-60"
              >
                {isSaving ? <Spinner size="sm" className="text-white" /> : <CheckCircle className="h-3.5 w-3.5" />}
                <span>Save New Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
