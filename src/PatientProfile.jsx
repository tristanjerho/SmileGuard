import React from 'react';
import { Calendar, Edit3, Mail, MapPin, Phone, User } from 'lucide-react';

export default function PatientProfile() {
    const profile = {
        name: 'Maria Santos',
        id: 'Patient ID #10024',
        status: 'Active Patient',
        dob: 'March 12, 1998',
        phone: '0917 123 4567',
        email: 'maria.santos@email.com',
        address: 'Quezon City, Metro Manila',
    };

    const detailRows = [
        { label: 'Date of Birth', value: profile.dob, icon: Calendar },
        { label: 'Phone', value: profile.phone, icon: Phone },
        { label: 'Email', value: profile.email, icon: Mail },
        { label: 'Address', value: profile.address, icon: MapPin },
    ];

    return (
        <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-50 bg-[#008B8B] text-2xl font-black text-white">
                        MS
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{profile.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{profile.id}</p>
                    <span className="mt-3 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                        {profile.status}
                    </span>
                </div>

                <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="divide-y divide-slate-100">
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Full Name</p>
                                    <p className="text-sm font-semibold text-slate-700">{profile.name}</p>
                                </div>
                            </div>
                        </div>

                        {detailRows.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="flex items-center justify-between px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                                            <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-[#008B8B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007474]">
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
