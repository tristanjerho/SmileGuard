import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';

export default function MyAppointments() {
  const myData = [
    { id: 'APT-1042', service: 'Braces Adjustment', doctor: 'Dr. Ana Santos', date: 'Tomorrow', time: '10:00 AM', status: 'Confirmed' },
    { id: 'APT-0981', service: 'Routine Check-up', doctor: 'Dr. Ana Santos', date: 'Apr 2, 2026', time: '09:00 AM', status: 'Pending' }
  ];

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">My Appointments</h3>
            <p className="mt-1 text-sm text-slate-500">Your personal care schedule for upcoming visits</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            2 entries
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <th className="px-6 py-3">Appointment ID</th>
              <th className="px-4 py-3">Service Type</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Scheduled Date</th>
              <th className="px-4 py-3">Time Slot</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myData.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50/40">
                <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">{row.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">{row.service}</td>
                <td className="px-4 py-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {row.doctor}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {row.date}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {row.time}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${row.status === 'Confirmed' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
