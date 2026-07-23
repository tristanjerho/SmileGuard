import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';

export default function PatientProfileCard() {
    return (
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-100 bg-emerald-50 text-2xl font-black text-emerald-700">
                    MS
                </div>
                <h2 className="mt-5 text-3xl font-black text-slate-900">Maria Santos</h2>
                <p className="mt-2 text-sm text-slate-500">Patient ID #10024</p>
            </div>

            <div className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60">
                <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contact Information</p>
                        <div className="mt-2 space-y-2 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                0917 123 4567
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                maria.santos@email.com
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Account Status</p>
                        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            Active treatment plan
                        </div>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                        Verified Patient
                    </div>
                </div>
            </div>
        </div>
    );
}
