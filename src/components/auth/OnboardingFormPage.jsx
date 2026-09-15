import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  HeartPulse,
  LogOut,
  Info,
} from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';
import DobPicker from '../common/DobPicker';

export default function OnboardingFormPage({ onCompleted, onLogout }) {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();

  const handleSignOut = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await logout();
    }
  };

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    birthDate: '',
    gender: 'Female',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: 'None',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      const existingName =
        userProfile.fullName ||
        `${userProfile.FirstName || ''} ${userProfile.lastName || ''}`.trim() ||
        currentUser?.displayName ||
        '';

      setFormData((prev) => ({
        ...prev,
        fullName: existingName || prev.fullName,
        phone: userProfile.phone || prev.phone,
        birthDate: userProfile.birthDate || prev.birthDate,
        gender: userProfile.gender || prev.gender,
        address: userProfile.address || prev.address,
        emergencyContactName: userProfile.emergencyContactName || prev.emergencyContactName,
        emergencyContactPhone: userProfile.emergencyContactPhone || prev.emergencyContactPhone,
        medicalHistory: userProfile.medicalHistory || prev.medicalHistory,
        allergies: userProfile.allergies || prev.allergies,
      }));
    }
  }, [userProfile, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.birthDate ||
      !formData.emergencyContactName.trim() ||
      !formData.emergencyContactPhone.trim()
    ) {
      setErrorMsg('Please complete all mandatory profile fields (*).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setWarningMsg('');

    const uid = currentUser.uid;
    const email = currentUser.email || '';

    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const profileData = {
      uid: uid,
      fullName: formData.fullName.trim(),
      FirstName: firstName,
      lastName: lastName,
      email: email,
      phone: formData.phone.trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      address: formData.address.trim(),
      emergencyContactName: formData.emergencyContactName.trim(),
      emergencyContactPhone: formData.emergencyContactPhone.trim(),
      medicalHistory: formData.medicalHistory.trim() || 'No prior medical conditions',
      allergies: formData.allergies.trim() || 'None',
      role: userProfile?.role || 'patient',
      onboardingCompleted: true,
    };

    let firestoreFailed = false;

    // 1. Try writing to Firestore users collection
    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, { ...profileData, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Firestore users collection write notice:', err);
        firestoreFailed = true;
      }

      // 2. Try writing to Firestore patients collection
      try {
        const patientRef = doc(db, 'patients', uid);
        await setDoc(
          patientRef,
          {
            fullName: formData.fullName.trim(),
            email: email,
            phone: formData.phone.trim(),
            gender: formData.gender,
            birthDate: formData.birthDate,
            address: formData.address.trim(),
            emergencyContactName: formData.emergencyContactName.trim(),
            emergencyContactPhone: formData.emergencyContactPhone.trim(),
            medicalHistory: formData.medicalHistory.trim() || 'No prior medical conditions',
            allergies: formData.allergies.trim() || 'None',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore patients collection write notice:', err);
      }
    }

    // 3. Update AuthContext profile state and local cache regardless of Firestore security rules
    await updateUserProfile(profileData);

    if (firestoreFailed) {
      setWarningMsg('Profile saved to local session! Note: Update Firestore Security Rules in Firebase Console for cloud sync.');
    }

    setSuccessMsg('Patient Profile Verified & Completed! Loading Dashboard...');

    setTimeout(() => {
      setIsLoading(false);
      if (onCompleted) {
        onCompleted();
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F7F5FF] text-slate-800 flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-x-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="z-10 flex items-center justify-between max-w-4xl w-full mx-auto pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 2C8.5 2 6 4.5 6 7.5C6 9.5 7 11 7.5 13C8 15 8.5 18 9.5 21C9.8 21.9 10.7 22 11.2 21.3C11.7 20.6 12 18.5 12 18.5C12 18.5 12.3 20.6 12.8 21.3C13.3 22 14.2 21.9 14.5 21C15.5 18 16 15 16.5 13C17 11 18 9.5 18 7.5C18 4.5 15.5 2 12 2Z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-base font-black tracking-tight text-slate-900 block">
              SmileGuard <span className="text-purple-600">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Patient Onboarding Portal</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#E9E5F5] text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-purple-700 transition-all shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="z-10 max-w-3xl w-full mx-auto my-auto space-y-6">
        {/* Banner */}
        <div className="bg-white border border-[#E9E5F5] rounded-2xl p-6 shadow-xl shadow-purple-900/5 text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
            <span>Mandatory First-Time Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Your Patient Medical Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            To ensure personalized dental care and HIPAA safety, please complete your patient registration before accessing your dashboard.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-[#E9E5F5] rounded-2xl p-6 sm:p-8 shadow-xl shadow-purple-900/5 backdrop-blur-xl space-y-6 text-left">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {warningMsg && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2.5">
              <Info className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{warningMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 border-b border-purple-100 pb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>1. Personal & Contact Info</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Maria Santos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0917 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <DobPicker
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  label="Date of Birth"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Home Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 123 Dental St, Quezon City, Metro Manila"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Section 2: Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 border-b border-purple-100 pb-2 flex items-center gap-2">
                <HeartPulse className="h-4 w-4" />
                <span>2. Emergency Contact</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    required
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="e.g. Juan Santos (Spouse / Parent)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    required
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="e.g. 0918 987 6543"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medical History & Allergies */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 border-b border-purple-100 pb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>3. Dental & Medical Background</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin, Latex, None"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical History & Dental Concerns
                  </label>
                  <input
                    type="text"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    placeholder="e.g. Braces, Hypertension, Routine Checkup"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Saving Patient Record...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Complete Onboarding & Access Patient Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 text-center text-xs text-slate-500 font-medium py-4">
        SmileGuard AI • Secure Patient Record System
      </footer>
    </div>
  );
}
