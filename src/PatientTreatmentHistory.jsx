import React from 'react';
import { CalendarDays, ChevronRight, Sparkles } from 'lucide-react';

const timeline = [
    {
        title: 'Bracket Placement',
        doctor: 'Dr. Ana Santos',
        note: 'Upper arch brackets aligned and wire tension adjusted for improved tracking.',
        date: 'May 12, 2026',
    },
    {
        title: 'Routine Cleaning',
        doctor: 'Dr. Rhea Navarro',
        note: 'Professional cleaning completed with fluoride application and oral care review.',
        date: 'Apr 02, 2026',
    },
    {
        title: 'Adjustment Follow-up',
        doctor: 'Dr. Ana Santos',
        note: 'Patient reported and confirmed comfortable bite alignment after the last adjustment.',
        date: 'Mar 10, 2026',
    },
];

export default function PatientTreatmentHistory() {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Braces Monitoring</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">67% complete</h2>
                        <p className="mt-1 text-sm text-slate-500">Stage 4 of 6 • Next adjustment reminder: Tomorrow at 10:30 AM</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600">
                        <Sparkles className="h-4 w-4" />
                        Track progress smoothly
                    </div>
                </div>

                <div className="mt-5">
                    <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 w-[67%] rounded-full bg-emerald-500" />
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">Treatment Timeline</h3>
                    <button className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        View full log
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-5 space-y-3">
                    {timeline.map((item) => (
                        <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">{item.title}</p>
                                            <p className="text-sm text-slate-500">{item.doctor}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-400">{item.date}</span>
                                    </div>
                                    <p className="mt-2 text-sm italic text-slate-500">“{item.note}”</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
