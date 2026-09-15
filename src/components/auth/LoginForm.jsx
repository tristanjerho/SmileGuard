import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, User } from 'lucide-react';
import InputField from './InputField';
import PasswordField from './PasswordField';
import Button from './Button';
import SocialLogin from './SocialLogin';
import ForgotPasswordModal from './ForgotPasswordModal';
import { auth, googleProvider } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';

import { syncUserWithFirestore } from '../../services/userService';

/**
 * Interactive LoginForm component with complete Firebase Authentication handling,
 * real-time validation, accessibility attributes, and responsive design.
 */
export default function LoginForm({ onSuccess, onToggleViewMode, onSwitchToAdmin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Load remembered email if present
  useEffect(() => {
    const savedEmail = localStorage.getItem('smileguard_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmailFormat = (val) => {
    if (!val.trim()) return 'Email address is required.';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val.trim())) return 'Please enter a valid email address (e.g. name@domain.com).';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters long.';
    return '';
  };

  const validateFullName = (val) => {
    if (isRegisterMode && !val.trim()) return 'Full Name is required.';
    return '';
  };

  const handleBlurOrChange = (field, value) => {
    setFirebaseError('');
    if (field === 'email') {
      setEmail(value);
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: validateEmailFormat(value) }));
      }
    } else if (field === 'password') {
      setPassword(value);
      if (errors.password) {
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
      }
    } else if (field === 'fullName') {
      setFullName(value);
      if (errors.fullName) {
        setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmailFormat(email);
    const passErr = validatePassword(password);
    const nameErr = validateFullName(fullName);

    if (emailErr || passErr || nameErr) {
      setErrors({ email: emailErr, password: passErr, fullName: nameErr });
      return;
    }

    setErrors({});
    setFirebaseError('');
    setIsLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('smileguard_remembered_email', email.trim());
      } else {
        localStorage.removeItem('smileguard_remembered_email');
      }

      let userCredential;
      if (auth) {
        if (isRegisterMode) {
          userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          if (fullName.trim() && userCredential.user) {
            await updateProfile(userCredential.user, { displayName: fullName.trim() });
          }
        } else {
          userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        }
      } else {
        // Fallback simulation for demo/test mode
        await new Promise((res) => setTimeout(res, 1200));
        userCredential = { user: { email: email.trim(), displayName: fullName || 'Patient User' } };
      }

      if (userCredential?.user) {
        await syncUserWithFirestore(userCredential.user, fullName);
      }

      setIsSuccess(true);
      setSuccessMsg(isRegisterMode ? 'Account created successfully! Redirecting...' : 'Authentication successful! Loading Patient Portal...');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(userCredential?.user || { email: email.trim() });
        }
      }, 1200);
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      let userFriendlyMsg = 'Authentication failed. Please check your credentials.';

      switch (err.code) {
        case 'auth/user-not-found':
          userFriendlyMsg = 'No account found with this email. Please check your spelling or register.';
          break;
        case 'auth/wrong-password':
          userFriendlyMsg = 'Incorrect password. Click "Forgot password?" to reset it.';
          break;
        case 'auth/invalid-credential':
          userFriendlyMsg = 'Invalid email or password. Please verify your details.';
          break;
        case 'auth/email-already-in-use':
          userFriendlyMsg = 'An account with this email address already exists. Please sign in instead.';
          break;
        case 'auth/too-many-requests':
          userFriendlyMsg = 'Too many unsuccessful attempts. Access disabled temporarily. Try again later.';
          break;
        case 'auth/weak-password':
          userFriendlyMsg = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/invalid-email':
          userFriendlyMsg = 'The email address format is invalid.';
          break;
        default:
          userFriendlyMsg = err.message || userFriendlyMsg;
      }
      setFirebaseError(userFriendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFirebaseError('');
    setIsGoogleLoading(true);
    try {
      let userCredential;
      if (auth && googleProvider) {
        userCredential = await signInWithPopup(auth, googleProvider);
      } else {
        await new Promise((res) => setTimeout(res, 1000));
        userCredential = { user: { email: 'google.patient@smileguard.ai', displayName: 'Google Verified Patient' } };
      }

      if (userCredential?.user) {
        await syncUserWithFirestore(userCredential.user);
      }

      setIsSuccess(true);
      setSuccessMsg('Google Authentication Verified! Redirecting...');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(userCredential?.user);
        }
      }, 1000);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setFirebaseError(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      {/* Role Selection Toggle */}
      {onSwitchToAdmin && (
        <div className="flex items-center justify-center p-1 rounded-xl bg-[#F7F5FF] border border-[#E9E5F5] max-w-xs mx-auto mb-2 shadow-xs">
          <button
            type="button"
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-white text-[#6D5AE6] shadow-xs border border-[#E9E5F5]"
          >
            👤 Patient Sign In
          </button>
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-[#667085] hover:text-[#6D5AE6] transition-colors"
          >
            🩺 Dentist / Admin
          </button>
        </div>
      )}

      {/* Header section inside card */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isRegisterMode ? 'Create Patient Account' : 'Patient Portal'}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {isRegisterMode
            ? 'Register to access smart appointments and AI dental diagnostics.'
            : 'Sign in to access your dental records.'}
        </p>
      </div>

      {/* Success Animation Notification */}
      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Firebase Error Notification */}
      {firebaseError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium flex items-start gap-3 animate-slide-up"
        >
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span className="flex-1">{firebaseError}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {isRegisterMode && (
          <InputField
            id="full-name"
            name="fullName"
            type="text"
            label="Full Name"
            value={fullName}
            onChange={(e) => handleBlurOrChange('fullName', e.target.value)}
            placeholder="e.g. Maria Santos"
            icon={User}
            error={errors.fullName}
            required
            disabled={isLoading || isSuccess}
          />
        )}

        <InputField
          id="email-address"
          name="email"
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => handleBlurOrChange('email', e.target.value)}
          placeholder="patient@example.com"
          icon={Mail}
          error={errors.email}
          required
          autoComplete="email"
          disabled={isLoading || isSuccess}
        />

        <PasswordField
          id="patient-password"
          name="password"
          label="Password"
          value={password}
          onChange={(e) => handleBlurOrChange('password', e.target.value)}
          placeholder="••••••••"
          error={errors.password}
          required
          autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
          disabled={isLoading || isSuccess}
        />

        {/* Remember Me & Forgot Password Links */}
        {!isRegisterMode && (
          <div className="flex items-center justify-between pt-1 pb-1 text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 transition-colors"
                disabled={isLoading || isSuccess}
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:underline transition-colors"
              disabled={isLoading || isSuccess}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit Primary Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={isGoogleLoading || isSuccess}
          ariaLabel={isRegisterMode ? 'Create Patient Account' : 'Sign In to Patient Portal'}
        >
          {isRegisterMode ? 'Create Patient Account' : 'Sign In'}
        </Button>
      </form>

      {/* Secondary Button / Mode Switch */}
      <div className="pt-1">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => {
            setIsRegisterMode((prev) => !prev);
            setErrors({});
            setFirebaseError('');
          }}
          disabled={isLoading || isGoogleLoading || isSuccess}
        >
          {isRegisterMode ? 'Already Have an Account? Sign In' : 'Create Patient Account'}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative px-3 bg-white dark:bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          OR
        </div>
      </div>

      {/* Social Login Section */}
      <SocialLogin
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        disabled={isLoading || isSuccess}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={email}
      />
    </div>
  );
}
