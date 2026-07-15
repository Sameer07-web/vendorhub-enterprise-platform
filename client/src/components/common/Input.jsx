import React, { forwardRef, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ label, error, success, helperText, required, className = '', icon: Icon, type = 'text', ...props }, ref) => {
  const isError = Boolean(error);
  const isSuccess = Boolean(success);
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5 animate-fade-in">
      {label && (
        <label className="text-sm font-medium text-surface-700 flex items-center gap-1">
          {label}
          {required && <span className="text-error-500" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          required={required}
          aria-invalid={isError ? "true" : "false"}
          className={`block w-full rounded-md border px-3 py-2 text-sm transition-all duration-150 placeholder:text-surface-400 focus:outline-none disabled:bg-surface-50 disabled:text-surface-500 disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : ''}
            ${(isError || isSuccess || isPassword) ? 'pr-9' : ''}
            ${isError 
              ? 'border-error-500 focus-visible:ring-2 focus-visible:ring-error-600 focus-visible:ring-offset-1 focus-visible:border-error-600 bg-error-50/10' 
              : isSuccess 
                ? 'border-success-500 focus-visible:ring-2 focus-visible:ring-success-600 focus-visible:ring-offset-1 focus-visible:border-success-600 bg-success-50/10' 
                : 'border-border focus-ring hover:border-border-hover'}
            ${className}`}
          {...props}
        />
        {isPassword && !isError && !isSuccess && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 focus-ring rounded-sm"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {isError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500 pointer-events-none animate-scale-in">
            <AlertCircle size={16} />
          </div>
        )}
        {isSuccess && !isError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500 pointer-events-none animate-scale-in">
            <CheckCircle size={16} />
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs font-medium text-error-600 animate-slide-up" role="alert">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-surface-500 animate-fade-in">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

