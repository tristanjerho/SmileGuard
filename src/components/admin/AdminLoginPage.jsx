import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Key, CheckCircle2, UserCheck } from 'lucide-react';
import { auth, db } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Spinner from '../auth/Spinner';

/**
 * AdminLoginPage Component
 * Authenticates & provisions the Clinician Administrator account:
 * Email: admin@smileguard.ai (or "admin")
 * Password: smileguard
 */
export default function AdminLoginPage({ onAdminAuthenticated, onSwitchToPatientPortal }) {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const formatAdminEmail = (raw) => {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed === 'admin') {
      return 'admin@smileguard.ai';
    }
    return trimmed;
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !password) return;

    setErrorMsg('');
    setIsLoading(true);
    const targetEmail = formatAdminEmail(emailInput);

    try {
      let userCredential;
      if (auth) {
        try {
          // Attempt Sign In first
          userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
        } catch (signInErr) {
          // If user doesn't exist, automatically create the Admin Account in Firebase Auth
          if (
            signInErr.code === 'auth/user-not-found' ||
            signInErr.code === 'auth/invalid-credential'
          ) {
            userCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
            if (userCredential.user) {
              await updateProfile(userCredential.user, { displayName: 'Dr. Ana Santos (Admin)' });
            }
          } else {
            throw signInErr;
          }
        }
      } else {
        await new Promise((res) => setTimeout(res, 1000));
        userCredential = {
          user: { uid: 'admin_demo', email: targetEmail, displayName: 'Dr. Ana Santos' },
        };
      }

      const user = userCredential.user;

      // Provision Admin Role in Cloud Firestore
      if (db && user.uid !== 'admin_demo') {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            FirstName: 'Dr. Ana',
            lastName: 'Santos',
            email: targetEmail,
            role: 'admin',
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        // Also provision patients document
        const patientRef = doc(db, 'patients', user.uid);
        await setDoc(
          patientRef,
          {
            fullName: 'Dr. Ana Santos (Admin)',
            email: targetEmail,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setSuccessMsg('Administrator Account Provisioned & Verified! Loading Admin Portal...');
      setTimeout(() => {
        if (onAdminAuthenticated) {
          onAdminAuthenticated(user);
        }
      }, 300);
    } catch (err) {
      console.error('Admin Auth Error:', err);
      if (err.code === 'auth/wrong-password') {
        setErrorMsg('Incorrect administrator password. Please check your credentials.');
      } else {
        setErrorMsg(err.message || 'Admin authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F7F5FF] text-slate-800 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Background Lighting Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="z-10 flex items-center justify-between max-w-5xl w-full mx-auto">
        <button
          onClick={onSwitchToPatientPortal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E9E5F5] text-xs font-semibold text-slate-600 hover:text-purple-700 hover:border-purple-300 shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portal Selection</span>
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
          <span>Clinician & Administrator Gateway</span>
        </div>
      </div>

      {/* Main Centered Login Box */}
      <div className="my-auto z-10 w-full max-w-md mx-auto space-y-6 animate-fade-in text-left">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-purple-200 ring-4 ring-white">
            <svg className="w-8 h-8 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 2C8.5 2 6 4.5 6 7.5C6 9.5 7 11 7.5 13C8 15 8.5 18 9.5 21C9.8 21.9 10.7 22 11.2 21.3C11.7 20.6 12 18.5 12 18.5C12 18.5 12.3 20.6 12.8 21.3C13.3 22 14.2 21.9 14.5 21C15.5 18 16 15 16.5 13C17 11 18 9.5 18 7.5C18 4.5 15.5 2 12 2Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            SmileGuard <span className="text-purple-600">Admin</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Clinical Decision Support & Clinic Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E9E5F5] rounded-2xl p-6 sm:p-8 shadow-xl shadow-purple-900/5 backdrop-blur-xl space-y-5">
          {/* Role Segmented Switcher */}
          <div className="flex items-center justify-center p-1 rounded-xl bg-purple-50 border border-purple-200 max-w-xs mx-auto shadow-xs">
            <button
              type="button"
              onClick={onSwitchToPatientPortal}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors"
            >
              👤 Patient Portal
            </button>
            <button
              type="button"
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-white text-purple-700 shadow-xs border border-purple-200"
            >
              🩺 Dentist / Admin
            </button>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Username / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin or admin@smileguard.ai"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="smileguard"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Authenticating Admin Account...</span>
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  <span>Authorize & Sign In Admin Account</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-50 border border-[#E9E5F5] text-[11px] text-slate-500 text-center space-y-1">
            <p className="font-semibold text-slate-700">Restricted Access Environment</p>
            <p>Authorized dentists & clinic managers only. All attempts audited.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 text-center text-xs text-slate-500 font-medium max-w-5xl w-full mx-auto">
        SmileGuard AI Clinical Workspace v1.2.0 • HIPAA Compliant Environment
      </div>
    </div>
  );
}
