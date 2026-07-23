import React from 'react';
import { ChevronRight } from 'lucide-react';

const cases = [
    {
        name: 'Maria Santos',
        timeline: 'Target: 6 months remaining',
        lastAdjustment: 'Adjusted 2 hours ago',
        stage: 'Stage 4 of 6',
        progress: 67,
    },
    {
        name: 'Carlo Mendoza',
        timeline: 'Target: 3 months remaining',
        lastAdjustment: 'Adjusted 1 day ago',
        stage: 'Stage 5 of 6',
        progress: 83,
    },
    {
        name: 'Juan dela Cruz',
        timeline: 'Target: 8 months remaining',
        lastAdjustment: 'Adjusted 3 days ago',
        stage: 'Stage 3 of 6',
        progress: 50,
    },
];

export default function BracesMonitoring() {
    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Braces Monitoring</h2>
                    <p className="text-sm text-slate-500 mt-1">Active orthodontic cases and treatment milestones</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {cases.map((patient) => (
                    <div key={patient.name} className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                {patient.name.split(' ').map((part) => part[0]).join('')}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{patient.name}</p>
                                <p className="text-sm text-slate-500">{patient.timeline}</p>
                                <p className="text-xs text-slate-400">{patient.lastAdjustment}</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md">
                            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                <span>{patient.stage}</span>
                                <span>{patient.progress}%</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-slate-100">
                                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${patient.progress}%` }} />
                            </div>
                        </div>

                        <button className="flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
                            View Detailed Orthodontic Log
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
