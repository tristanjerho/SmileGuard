import React from 'react';
import { Search } from 'lucide-react';

const patients = [
    {
        name: 'Maria Santos',
        demographics: '32 • Female',
        condition: 'Orthodontic Treatment',
        lastVisit: '2026-06-10',
        risk: 'Low',
    },
    {
        name: 'Carlo Mendoza',
        demographics: '41 • Male',
        condition: 'Periodontal Review',
        lastVisit: '2026-06-08',
        risk: 'High',
    },
    {
        name: 'Juan dela Cruz',
        demographics: '29 • Male',
        condition: 'General Prophylaxis',
        lastVisit: '2026-06-05',
        risk: 'Medium',
    },
    {
        name: 'Ana Reyes',
        demographics: '35 • Female',
        condition: 'Restorative Consultation',
        lastVisit: '2026-06-03',
        risk: 'Medium',
    },
];

const riskStyles = {
    High: 'bg-rose-50 text-rose-600 border-rose-200',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200',
    Low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export default function PatientRecords() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Patient Records</h2>
                    <p className="text-sm text-slate-500 mt-1">Registered clinic patients and current triage status</p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm min-w-[280px]">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search patient"
                        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {patients.map((patient) => (
                    <div key={patient.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                    {patient.name.split(' ').map((part) => part[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
                                    <p className="text-sm text-slate-500">{patient.demographics}</p>
                                </div>
                            </div>

                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${riskStyles[patient.risk]}`}>
                                {patient.risk} Risk
                            </span>
                        </div>

                        <div className="mt-5 space-y-2 text-sm text-slate-600">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Primary Condition</p>
                                <p className="mt-1 font-semibold text-slate-800">{patient.condition}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last Visit Date</p>
                                <p className="mt-1 font-semibold text-slate-800">{patient.lastVisit}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
