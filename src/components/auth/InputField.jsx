import React from 'react';

/**
 * Accessible Input Field Component with Icon, Label, and Validation feedback.
 * Unified dark glassmorphic theme — purple accent, dark bg input.
 */
export default function InputField({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
  icon: Icon,
  disabled = false,
  className = '',
}) {
  const errorId = `${id}-error`;

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}

        <input
          id={id}
          name={name || id}
          type={type}
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
            ${Icon ? 'pl-10' : 'pl-3.5'} pr-4 py-3
            bg-slate-800/60
            text-slate-100
            placeholder-slate-500
            border ${
              error
                ? 'border-red-500/80 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-600/80 hover:border-slate-500 focus:border-purple-500 focus:ring-purple-500'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-400 font-medium flex items-center gap-1.5 mt-1 animate-fade-in">
          <svg className="h-3.5 w-3.5 shrink-0 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
