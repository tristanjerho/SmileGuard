import React from 'react';
import { Activity, Stethoscope } from 'lucide-react';

export default function TreatmentHistory() {
    const historyLog = [
        { title: 'Braces Adjustment (Stage 4)', doctor: 'Dr. Ana Santos', date: 'Jun 18, 2026', note: 'Upper arch wire tightened. Good progress and improved symmetry.' },
        { title: 'Braces Adjustment (Stage 3)', doctor: 'Dr. Ana Santos', date: 'May 15, 2026', note: 'Both arches adjusted. Minor discomfort expected for 24 hours.' },
        { title: 'Dental Cleaning', doctor: 'Dr. Lito Cruz', date: 'Apr 2, 2026', note: 'Full prophylaxis completed with fluoride application.' },
        { title: 'Braces Placement (Stage 1)', doctor: 'Dr. Ana Santos', date: 'Feb 20, 2026', note: 'Initial brackets and wires placed with a smooth first fitting.' },
    ];

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Braces Progress</h3>
                        <p className="mt-1 text-sm text-slate-500">Active orthodontic milestone tracking and reminder updates</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                        Stage 4 of 6
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                            <span>67% Complete</span>
                            <span className="text-emerald-600">Next adjustment: Jul 2, 2026</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-[67%] rounded-full bg-emerald-500" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Started: Feb 20, 2026
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="px-1 text-sm font-semibold text-slate-900">Procedure History</h3>
                <div className="space-y-3">
                    {historyLog.map((log, i) => (
                        <div key={i} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                                <Stethoscope className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <h4 className="text-sm font-semibold text-slate-900">{log.title}</h4>
                                    <p className="text-xs font-medium text-slate-500">{log.date}</p>
                                </div>
                                <p className="mt-1 text-sm font-medium text-slate-500">{log.doctor}</p>
                                <p className="mt-2 text-sm italic text-slate-400">{log.note}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
