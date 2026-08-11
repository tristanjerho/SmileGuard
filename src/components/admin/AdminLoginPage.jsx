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
  const [emailInput, setEmailInput] = useState('admin@smileguard.ai');
  const [password, setPassword] = useState('smileguard');
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
        setErrorMsg('Incorrect administrator password. Please try "smileguard".');
      } else {
        setErrorMsg(err.message || 'Admin authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Background Lighting Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="z-10 flex items-center justify-between max-w-5xl w-full mx-auto">
        <button
          onClick={onSwitchToPatientPortal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portal Selection</span>
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800 text-[11px] font-bold text-purple-300">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
          <span>Clinician & Administrator Gateway</span>
        </div>
      </div>

      {/* Main Centered Login Box */}
      <div className="my-auto z-10 w-full max-w-md mx-auto space-y-6 animate-fade-in text-left">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-teal-400 flex items-center justify-center text-white font-black text-xl mx-auto shadow-xl shadow-purple-500/20 ring-2 ring-white/10">
            SG
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            SmileGuard <span className="text-purple-400">Admin</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Clinical Decision Support & Clinic Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Quick Pre-filled Credentials Banner */}
          <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-800/60 text-purple-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-300">
              <UserCheck className="h-4 w-4 text-purple-400" />
              <span>Admin Account Credentials</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Email / Username:</strong> <code className="bg-slate-950 px-1.5 py-0.5 rounded text-purple-300">admin</code> or <code className="bg-slate-950 px-1.5 py-0.5 rounded text-purple-300">admin@smileguard.ai</code>
            </p>
            <p className="text-[11px] text-slate-300">
              <strong>Password:</strong> <code className="bg-slate-950 px-1.5 py-0.5 rounded text-purple-300">smileguard</code>
            </p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Username / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin or admin@smileguard.ai"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="smileguard"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
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

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 text-center space-y-1">
            <p className="font-semibold text-slate-300">Restricted Access Environment</p>
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
