import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    ShieldCheck,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';

export default function BookAppointment() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        service: '',
        date: '',
        time: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const services = [
        {
            id: 'checkup',
            name: 'Routine Check-up',
            duration: '30 mins',
            desc: 'Standard cleaning, scaling, and oral exam.',
        },
        {
            id: 'braces',
            name: 'Braces Adjustment',
            duration: '45 mins',
            desc: 'Wire tightening, bracket review, and progress track.',
        },
        {
            id: 'ai-scan',
            name: 'AI Diagnostic Scan',
            duration: '15 mins',
            desc: 'High-res imaging processed by CNN diagnostics.',
        },
    ];

    const timeSlots = ['09:00 AM', '10:30 AM', '01:30 PM', '03:00 PM'];

    const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Appointment Requested!</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Your request for a <span className="font-semibold text-slate-700">{formData.service}</span> on {formData.date} at {formData.time} has been sent to Dr. Ana Santos for review.
                </p>
                <button
                    onClick={() => {
                        setStep(1);
                        setIsSubmitted(false);
                        setFormData({ service: '', date: '', time: '' });
                    }}
                    className="w-full py-2.5 bg-[#008B8B] hover:bg-[#007A7A] text-white font-semibold text-sm rounded-lg transition-colors"
                >
                    Book Another Appointment
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6 w-full max-w-md mx-auto">
                    {[1, 2, 3].map((num, i) => (
                        <React.Fragment key={num}>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= num ? 'bg-[#008B8B] text-white' : 'bg-slate-200 text-slate-500'
                                        }`}
                                >
                                    {num}
                                </div>
                                <span className={`text-xs font-semibold ${step >= num ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {num === 1 ? 'Service' : num === 2 ? 'Schedule' : 'Confirm'}
                                </span>
                            </div>
                            {i < 2 && <div className={`flex-1 h-0.5 transition-all ${step > num ? 'bg-[#008B8B]' : 'bg-slate-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {step === 1 && (
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-slate-900">Select Dental Treatment</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {services.map((srv) => (
                                <label
                                    key={srv.id}
                                    className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50/50 ${formData.service === srv.name
                                            ? 'border-[#008B8B] bg-emerald-50/20 ring-2 ring-[#008B8B]/10'
                                            : 'border-slate-200'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="service"
                                        value={srv.name}
                                        checked={formData.service === srv.name}
                                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                        className="mt-1 accent-[#008B8B]"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-sm font-bold text-slate-900">{srv.name}</h4>
                                            <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                                                {srv.duration}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{srv.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-900">Choose Appointment Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#008B8B]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-900">Available Time Slots</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {timeSlots.map((time) => (
                                    <button
                                        type="button"
                                        key={time}
                                        onClick={() => setFormData({ ...formData, time })}
                                        className={`py-2 px-3 border text-xs font-semibold rounded-lg text-center transition-all ${formData.time === time
                                                ? 'bg-[#008B8B] text-white border-[#008B8B]'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Review Summary</h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-400 font-medium">Selected Service</span>
                                <span className="font-bold text-slate-800">{formData.service || 'Not chosen'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-400 font-medium">Target Date</span>
                                <span className="font-semibold text-slate-800">{formData.date || 'Not chosen'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Assigned Time</span>
                                <span className="font-semibold text-slate-800">{formData.time || 'Not chosen'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-50 border border-slate-100 p-3 rounded-lg">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Data Security Note: This booking is bound directly to Patient ID #10024.</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors ${step === 1 ? 'invisible' : ''
                            }`}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={(step === 1 && !formData.service) || (step === 2 && (!formData.date || !formData.time))}
                            className="flex items-center gap-1 text-xs font-bold px-4 py-2 bg-[#008B8B] hover:bg-[#007A7A] disabled:opacity-50 disabled:hover:bg-[#008B8B] text-white rounded-lg transition-colors"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="text-xs font-bold px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg transition-colors shadow-sm"
                        >
                            Confirm Booking Request
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
