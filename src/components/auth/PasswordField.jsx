import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

/**
 * Accessible Password Field Component with Lock icon and Show/Hide toggle.
 */
export default function PasswordField({
  id = 'password',
  name = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  required = false,
  autoComplete = 'current-password',
  disabled = false,
  className = '',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = `${id}-error`;

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </div>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
            pl-10 pr-11 py-3
            bg-slate-50 dark:bg-slate-900/90
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            border ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 focus:ring-blue-600'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        />

        <button
          type="button"
          onClick={togglePassword}
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1.5 mt-1 animate-fade-in">
          <svg className="h-3.5 w-3.5 shrink-0 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
