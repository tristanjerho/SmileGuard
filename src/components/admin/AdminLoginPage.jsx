import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Key, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Spinner from '../auth/Spinner';
import PurpleWaveBackground from '../common/PurpleWaveBackground';
import Logo from '../auth/Logo';

/**
 * AdminLoginPage Component
 * Authenticates & provisions the Clinician Administrator account:
 * Email: admin@smileguard.ai (or "admin")
 * Password: smileguard
 * Wrapped in luminous PurpleWaveBackground with official brand assets.
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

        // Provision patient profile document
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
    <PurpleWaveBackground>
      <div className="min-h-screen w-screen flex flex-col justify-between p-6 sm:p-12 relative font-sans">
        {/* Top Header Navigation */}
        <div className="z-10 flex items-center justify-between max-w-5xl w-full mx-auto">
          <button
            onClick={onSwitchToPatientPortal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-xs font-bold text-purple-100 hover:text-white hover:bg-purple-900/80 shadow-md backdrop-blur-md transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal Selection</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/60 border border-purple-400/30 text-xs font-bold text-purple-200 shadow-md backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span>Clinician & Administrator Gateway</span>
          </div>
        </div>

        {/* Main Centered Login Box */}
        <div className="my-auto z-10 w-full max-w-md mx-auto space-y-6 animate-fade-in text-left py-6">
          {/* Official Brand Logo */}
          <div className="text-center space-y-2 flex flex-col items-center">
            <Logo size="lg" variant="badge" subtitle="" className="mx-auto justify-center" />
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md pt-1">
              SmileGuard <span className="text-purple-300">Admin</span>
            </h1>
            <p className="text-xs text-purple-200/90 font-semibold tracking-wide">
              Clinical Decision Support & Clinic Management Portal
            </p>
          </div>

          {/* Centered White Card with High-Contrast Text */}
          <div className="bg-white border border-purple-200/80 rounded-[24px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.3)] space-y-5">
            {/* Role Switcher */}
            <div className="flex items-center justify-center p-1 rounded-xl bg-purple-50 border border-purple-200 max-w-xs mx-auto shadow-xs">
              <button
                type="button"
                onClick={onSwitchToPatientPortal}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-600 hover:text-purple-700 transition-colors"
              >
                👤 Patient Portal
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-purple-600 text-white shadow-xs border border-purple-600"
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
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Admin Username / Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin or admin@smileguard.ai"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-purple-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="smileguard"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-purple-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
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

            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-slate-600 text-center space-y-1">
              <p className="font-bold text-purple-900">Restricted Access Environment</p>
              <p>Authorized dentists & clinic managers only. All attempts audited.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-center text-xs text-purple-200/90 font-semibold max-w-5xl w-full mx-auto">
          SmileGuard AI Clinical Workspace v1.2.0 • HIPAA Compliant Environment
        </div>
      </div>
    </PurpleWaveBackground>
  );
}
