import React, { useState } from 'react';
import {
  Phone,
  Mail,
  ShieldCheck,
  User,
  Calendar,
  MapPin,
  HeartPulse,
  FileText,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Stethoscope,
  Clock,
  Sparkles,
  ShieldAlert,
  Activity,
  Award
} from 'lucide-react';
import { useAuth } from './context/AuthContext';

export default function PatientProfileCard() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile data from AuthContext or realistic default fallbacks
  const fullName =
    userProfile?.fullName ||
    `${userProfile?.FirstName || ''} ${userProfile?.lastName || ''}`.trim() ||
    currentUser?.displayName ||
    'Maria Santos';

  const email = userProfile?.email || currentUser?.email || 'maria.santos@email.com';
  const phone = userProfile?.phone || '0917 123 4567';
  const birthDate = userProfile?.birthDate || '1998-03-12';
  const address = userProfile?.address || 'Quezon City, Metro Manila, Philippines';
  const emergencyName = userProfile?.emergencyContactName || 'Juan Santos';
  const emergencyPhone = userProfile?.emergencyContactPhone || '0918 987 6543';
  const emergencyRelation = userProfile?.emergencyRelation || 'Spouse';
  const medicalHistory = userProfile?.medicalHistory || 'Mild Controlled Hypertension • Routine Dental Checkup';
  const allergies = userProfile?.allergies || 'Penicillin, Latex Sensitivity';
  const hmoProvider = userProfile?.hmoProvider || 'Maxicare Healthcare Solutions';
  const hmoMemberId = userProfile?.hmoMemberId || 'MX-9948201-P';
  const primaryDentist = userProfile?.primaryDentist || 'Dr. Ana Santos';
  const preferredComm = userProfile?.preferredComm || 'SMS & Email (English/Tagalog)';

  // Edit Form State
  const [formData, setFormData] = useState({
    fullName,
    phone,
    birthDate,
    address,
    emergencyContactName: emergencyName,
    emergencyContactPhone: emergencyPhone,
    emergencyRelation,
    medicalHistory,
    allergies,
    hmoProvider,
    hmoMemberId,
    primaryDentist,
    preferredComm
  });

  const initials = fullName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyRelation: formData.emergencyRelation,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        hmoProvider: formData.hmoProvider,
        hmoMemberId: formData.hmoMemberId,
        primaryDentist: formData.primaryDentist,
        preferredComm: formData.preferredComm
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update patient profile:', err);
      alert('Failed to save profile updates.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-left font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-teal-100 bg-teal-600 text-2xl font-black text-white shadow-inner">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{fullName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Active Patient</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 flex items-center justify-center sm:justify-start gap-2">
                <span>Patient ID:</span>
                <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-mono font-bold">
                  {currentUser?.uid ? `UID-${currentUser.uid.substring(0, 8).toUpperCase()}` : 'PATIENT-#10024'}
                </code>
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-medium text-slate-600 pt-0.5">
                <span className="flex items-center gap-1 text-teal-700 font-bold">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                  {primaryDentist}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Verified Cloud Record
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Quick KPI Stat Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-600" />
              <span>Clinical Risk</span>
            </p>
            <p className="text-xs font-black text-emerald-900">Low Risk (Routine)</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1">
              <Clock className="h-3 w-3 text-teal-600" />
              <span>Hygiene Recall</span>
            </p>
            <p className="text-xs font-black text-teal-900">Due in 2 Months</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-600" />
              <span>X-Ray Scans</span>
            </p>
            <p className="text-xs font-black text-purple-900">3 Panoramic Records</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-blue-600" />
              <span>HMO Status</span>
            </p>
            <p className="text-xs font-black text-blue-900">Maxicare Active</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Profile updates saved and synchronized to Cloud Firestore!</span>
          </div>
        )}
      </div>

      {/* Main Grid: Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Personal & Contact Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" />
            <span>PERSONAL & CONTACT DETAILS</span>
          </h3>

          <div className="space-y-3.5 text-xs font-medium text-slate-700">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                <p className="font-semibold text-slate-900">{email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Primary Phone Number</p>
                <p className="font-semibold text-slate-900">{phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Date of Birth</p>
                <p className="font-semibold text-slate-900">{birthDate} (28 yrs)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Home Address</p>
                <p className="font-semibold text-slate-900">{address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Communication Preference</p>
                <p className="font-semibold text-slate-900">{preferredComm}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Medical & Dental Safety Alerts (Clinical Focus) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>MEDICAL & SAFETY ALERTS</span>
          </h3>

          <div className="space-y-4 text-xs font-medium">
            {/* Allergies */}
            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Known Allergies & Sensitivities</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergies.split(',').map((alg, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 font-bold text-[11px] border border-rose-200">
                    {alg.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical History */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">Medical Conditions & History</p>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">{medicalHistory}</p>
            </div>

            {/* Dental Anxiety Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <p className="text-[10px] font-bold uppercase text-amber-800">Clinical Anxiety & Treatment Preferences</p>
              <p className="text-xs font-medium text-slate-800">
                Mild dental anxiety noted. Prefers gentle scaling and topical anesthetic prior to injections.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Emergency Contact Person */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-rose-500" />
            <span>EMERGENCY CONTACT</span>
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Emergency Contact</p>
                <p className="text-sm font-bold text-slate-900">{emergencyName}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700 font-bold text-[10px]">
                {emergencyRelation}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 font-semibold pt-1 border-t border-slate-200/70">
              <Phone className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Direct Phone: <strong>{emergencyPhone}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 4: Insurance & HMO Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span>DENTAL INSURANCE & HMO COVERAGE</span>
          </h3>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-blue-700">HMO Provider</p>
                <p className="text-sm font-bold text-slate-900">{hmoProvider}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Active Coverage
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1 border-t border-blue-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400">Member ID</p>
                <p className="font-mono font-bold text-slate-800">{hmoMemberId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">Annual Limit</p>
                <p className="font-bold text-slate-800">₱100,000 / year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Edit3 className="h-5 w-5 text-teal-600" />
                <span>Edit Patient Profile</span>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Dentist</label>
                  <input
                    type="text"
                    name="primaryDentist"
                    value={formData.primaryDentist}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Home Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1">Allergies & Sensitivities</label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleFormChange}
                    placeholder="e.g. Penicillin, Latex"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Conditions</label>
                  <input
                    type="text"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleFormChange}
                    placeholder="e.g. Hypertension, Diabetes"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1">HMO Provider</label>
                  <input
                    type="text"
                    name="hmoProvider"
                    value={formData.hmoProvider}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1">HMO Member ID</label>
                  <input
                    type="text"
                    name="hmoMemberId"
                    value={formData.hmoMemberId}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
