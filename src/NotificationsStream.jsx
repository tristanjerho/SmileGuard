import React from 'react';
import { Bell, CalendarDays } from 'lucide-react';

const groups = [
    {
        title: 'Today',
        items: [
            { id: 1, title: 'Your next hygiene appointment is confirmed for 3:00 PM.', time: '10 mins ago', unread: true, icon: CalendarDays },
            { id: 2, title: 'Your treatment progress update is ready to review.', time: '45 mins ago', unread: false, icon: Bell },
        ],
    },
    {
        title: 'Yesterday',
        items: [
            { id: 3, title: 'Reminder: submit your oral care checklist before noon.', time: 'Yesterday, 8:30 AM', unread: true, icon: Bell },
        ],
    },
    {
        title: 'Older Updates',
        items: [
            { id: 4, title: 'Your brace adjustment summary has been posted.', time: 'Jun 20, 2026', unread: false, icon: CalendarDays },
        ],
    },
];

export default function NotificationsStream() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900">Notifications</h2>
                <p className="text-sm text-slate-500 mt-1">Your recent updates and care reminders</p>
            </div>

            <div className="space-y-6">
                {groups.map((group) => (
                    <div key={group.title}>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{group.title}</h3>
                        <div className="space-y-3">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.id} className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm ${item.unread ? 'shadow-emerald-50' : 'opacity-80'}`}>
                                        <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${item.unread ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${item.unread ? 'text-slate-800' : 'text-slate-500'}`}>
                                                {item.title}
                                            </p>
                                            <p className={`mt-1 text-sm ${item.unread ? 'text-slate-500' : 'text-slate-400'}`}>{item.time}</p>
                                        </div>
                                        {item.unread && <div className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
