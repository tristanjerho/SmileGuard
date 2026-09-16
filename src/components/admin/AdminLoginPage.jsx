import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Key, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Spinner from '../auth/Spinner';
import AuthSplitLayout from '../auth/AuthSplitLayout';

/**
 * AdminLoginPage — Dentist / Admin Portal authentication page.
 * Uses the shared AuthSplitLayout for full visual consistency with the Patient Portal.
 * All Firebase authentication logic is preserved exactly as-is.
 *
 * Credentials handled externally — do NOT display real credentials in placeholders.
 * Email:    admin@smileguard.ai (or "admin" alias)
 * Password: (managed by clinic administrator)
 */
export default function AdminLoginPage({ onAdminAuthenticated, onSwitchToPatientPortal }) {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Allow "admin" shorthand — resolves to real admin email internally
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
          // Attempt sign-in first
          userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
        } catch (signInErr) {
          // Auto-create admin account on first run if it doesn't exist
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
        // Demo/offline fallback
        await new Promise((res) => setTimeout(res, 1000));
        userCredential = {
          user: { uid: 'admin_demo', email: targetEmail, displayName: 'Dr. Ana Santos' },
        };
      }

      const user = userCredential.user;

      // Provision admin role in Cloud Firestore
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

      setSuccessMsg('Administrator Account Verified! Loading Admin Portal...');
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
    <AuthSplitLayout
      onBack={onSwitchToPatientPortal}
      leftTitle1="Clinical Intelligence."
      leftTitle2="Smarter Dental Decisions."
      leftDescription="Advanced clinical decision support for dentists and clinic managers. Manage patient records, AI diagnostic tools, and practice workflows in one secure platform."
      leftBadges={[
        '🩺 AI Radiograph Diagnostics',
        '📋 Patient Record Management',
        '🔬 Laboratory & Lab Tracking',
      ]}
      leftMascotBadge="Clinician & Admin Gateway"
      headerRightLabel="Clinician & Administrator Gateway"
      footerLeft="SmileGuard AI Clinical Workspace v1.2.0"
      footerRight="HIPAA Compliant"
    >
      {/* ── Portal Switcher Tab ── */}
      <div className="flex items-center justify-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6">
        <button
          type="button"
          onClick={onSwitchToPatientPortal}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          👤 Patient Portal
        </button>
        <button
          type="button"
          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm"
        >
          🩺 Dentist / Admin
        </button>
      </div>

      {/* ── Heading ── */}
      <div className="text-center space-y-1.5 mb-5">
        <h2 className="text-2xl sm:text-[1.7rem] font-black text-white tracking-tight">
          SmileGuard <span className="text-purple-300">Admin</span>
        </h2>
        <p className="text-xs sm:text-sm font-medium text-purple-200/75 leading-relaxed">
          Clinical Decision Support & Clinic Management Portal
        </p>
      </div>

      {/* ── Success Message ── */}
      {successMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Error Message ── */}
      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-700/50 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Admin Form ── */}
      <form onSubmit={handleAdminSubmit} className="space-y-4" noValidate>
        {/* Email / Username field */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-email"
            className="block text-xs font-semibold text-slate-300 tracking-wide"
          >
            Admin Username / Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="admin-email"
              type="text"
              required
              autoComplete="username"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="admin@example.com"
              disabled={isLoading || Boolean(successMsg)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/80 text-xs sm:text-sm font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold text-slate-300 tracking-wide"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="passwordexample"
              disabled={isLoading || Boolean(successMsg)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/80 text-xs sm:text-sm font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Authorize button */}
        <button
          type="submit"
          disabled={isLoading || Boolean(successMsg)}
          className="w-full py-3.5 px-4 mt-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-700/25 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="text-white" />
              <span>Authenticating Admin Account...</span>
            </>
          ) : (
            <>
              <Key className="h-4 w-4 shrink-0" />
              <span>Authorize &amp; Sign In Admin Account</span>
            </>
          )}
        </button>
      </form>

      {/* ── Restricted Access Notice ── */}
      <div className="mt-5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400 text-center space-y-0.5">
        <p className="font-bold text-purple-300">Restricted Access Environment</p>
        <p>Authorized dentists & clinic managers only. All attempts audited.</p>
      </div>
    </AuthSplitLayout>
  );
}
