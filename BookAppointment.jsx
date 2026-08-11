import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    ShieldCheck,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Clock,
    Sparkles,
} from 'lucide-react';
import { db } from './src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './src/context/AuthContext';
import Spinner from './src/components/auth/Spinner';

export default function BookAppointment() {
    const { currentUser, userProfile } = useAuth();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        service: 'Routine Check-up',
        date: '',
        time: '09:00 AM',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.service || !formData.date || !formData.time) {
            setErrorMsg('Please select a service, date, and time slot.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const userId = currentUser?.uid || 'guest';
            const patientName = userProfile?.fullName || currentUser?.displayName || currentUser?.email || 'Patient';
            const patientEmail = currentUser?.email || '';
            const patientPhone = userProfile?.phone || '';

            if (db) {
                // 1. Write appointment to Firestore
                const apptRef = await addDoc(collection(db, 'appointments'), {
                    userId: userId,
                    patientName: patientName,
                    patientEmail: patientEmail,
                    patientPhone: patientPhone,
                    service: formData.service,
                    doctor: 'Dr. Ana Santos',
                    date: formData.date,
                    time: formData.time,
                    status: 'Pending',
                    createdAt: serverTimestamp(),
                });

                // 2. Write notification to Firestore
                await addDoc(collection(db, 'notifications'), {
                    userId: userId,
                    type: 'schedule',
                    title: 'Appointment Requested',
                    body: `Your request for ${formData.service} on ${formData.date} at ${formData.time} was submitted to Dr. Ana Santos.`,
                    unread: true,
                    createdAt: serverTimestamp(),
                });
            }

            setIsSubmitted(true);
        } catch (err) {
            console.error('Error booking appointment in Firestore:', err);
            setErrorMsg('Failed to submit appointment booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Appointment Requested!</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Your request for a <span className="font-semibold text-slate-800">{formData.service}</span> on <span className="font-semibold text-slate-800">{formData.date}</span> at <span className="font-semibold text-slate-800">{formData.time}</span> has been saved to Cloud Firestore and sent to Dr. Ana Santos.
                </p>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    Status: <span className="font-bold">Pending Approval</span> • Real-time update active
                </div>
                <button
                    onClick={() => {
                        setStep(1);
                        setIsSubmitted(false);
                        setFormData({ service: 'Routine Check-up', date: '', time: '09:00 AM' });
                    }}
                    className="w-full py-3 bg-[#008B8B] hover:bg-[#007A7A] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                    Book Another Appointment
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Step Wizard Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6 w-full max-w-md mx-auto">
                    {[1, 2, 3].map((num, i) => (
                        <React.Fragment key={num}>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        step >= num ? 'bg-[#008B8B] text-white shadow' : 'bg-slate-200 text-slate-500'
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

            {errorMsg && (
                <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-left">
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">1. Select Dental Treatment</h3>
                            <p className="text-xs text-slate-500">Choose the dental procedure you require.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {services.map((srv) => (
                                <label
                                    key={srv.id}
                                    className={`border rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50/50 ${
                                        formData.service === srv.name
                                            ? 'border-[#008B8B] bg-emerald-50/30 ring-2 ring-[#008B8B]/20'
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
                                            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
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
                        <div>
                            <h3 className="text-base font-bold text-slate-900">2. Pick Date & Time Slot</h3>
                            <p className="text-xs text-slate-500">Select an available appointment time.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700">Appointment Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#008B8B]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700">Available Clinical Slots</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {timeSlots.map((time) => (
                                    <button
                                        type="button"
                                        key={time}
                                        onClick={() => setFormData({ ...formData, time })}
                                        className={`py-2.5 px-3 border text-xs font-bold rounded-xl text-center transition-all ${
                                            formData.time === time
                                                ? 'bg-[#008B8B] text-white border-[#008B8B] shadow-sm'
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
                        <div>
                            <h3 className="text-base font-bold text-slate-900">3. Review & Confirm Booking</h3>
                            <p className="text-xs text-slate-500">Verify your appointment details before submitting.</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Patient Name</span>
                                <span className="font-bold text-slate-800">
                                    {userProfile?.fullName || currentUser?.displayName || currentUser?.email || 'Patient'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Selected Service</span>
                                <span className="font-bold text-slate-800">{formData.service}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Target Date</span>
                                <span className="font-bold text-slate-800">{formData.date || 'Not selected'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Assigned Time</span>
                                <span className="font-bold text-slate-800">{formData.time}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50/50 border border-emerald-200 p-3 rounded-xl">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>This booking will sync in real-time with Cloud Firestore.</span>
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className={`flex items-center gap-1 text-xs font-bold px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors ${
                            step === 1 ? 'invisible' : ''
                        }`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (step === 2 && !formData.date) {
                                    setErrorMsg('Please select an appointment date.');
                                    return;
                                }
                                setErrorMsg('');
                                handleNext();
                            }}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#008B8B] hover:bg-[#007A7A] text-white font-bold text-xs rounded-xl shadow transition-colors ml-auto"
                        >
                            <span>Next Step</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#008B8B] to-emerald-600 hover:from-[#007A7A] hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all ml-auto disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner size="sm" className="text-white" />
                                    <span>Submitting Booking...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Confirm & Book Appointment</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
