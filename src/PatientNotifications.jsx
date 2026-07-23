import React from 'react';
import { Bell, Calendar, Sparkles } from 'lucide-react';

export default function PatientNotifications() {
  const logs = [
    { id: 1, type: 'schedule', title: 'Upcoming Appointment Reminder', body: 'Your Braces Adjustment is scheduled for tomorrow at 10:00 AM with Dr. Ana Santos.', time: '2 hours ago', unread: true, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 2, type: 'ai', title: 'AI Scan Result Released', body: 'Dr. Santos uploaded your latest diagnostic imaging. Check your summary notes.', time: 'Yesterday', unread: true, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 3, type: 'general', title: 'Clinic Holiday Notice', body: 'SmileGuard Clinic will operate on shortened hours on July 4th.', time: '3 days ago', unread: false, icon: Bell, color: 'text-slate-400', bg: 'bg-slate-50' }
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {logs.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className={`flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-all ${item.unread ? 'border-emerald-200/80 bg-emerald-50/5' : 'border-slate-200 bg-white'}`}>
            <div className={`shrink-0 rounded-lg border border-transparent p-2 ${item.bg} ${item.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-500">{item.body}</p>
            </div>
            {item.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
          </div>
        );
      })}
    </div>
  );
}
