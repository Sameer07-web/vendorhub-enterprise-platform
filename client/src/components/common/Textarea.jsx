import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Textarea = forwardRef(({ label, error, success, helperText, required, className = '', icon: Icon, ...props }, ref) => {
  const isError = Boolean(error);
  const isSuccess = Boolean(success);

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
          <div className="absolute left-3 top-3 text-surface-400 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <textarea
          ref={ref}
          required={required}
          aria-invalid={isError ? "true" : "false"}
          className={`block w-full rounded-md border px-3 py-2 text-sm transition-all duration-150 placeholder:text-surface-400 focus:outline-none disabled:bg-surface-50 disabled:text-surface-500 disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : ''}
            ${(isError || isSuccess) ? 'pr-9' : ''}
            ${isError 
              ? 'border-error-500 focus-visible:ring-2 focus-visible:ring-error-600 focus-visible:ring-offset-1 focus-visible:border-error-600 bg-error-50/10' 
              : isSuccess 
                ? 'border-success-500 focus-visible:ring-2 focus-visible:ring-success-600 focus-visible:ring-offset-1 focus-visible:border-success-600 bg-success-50/10' 
                : 'border-border focus-ring hover:border-border-hover bg-white'}
            ${className}`}
          {...props}
        />
        {isError && (
          <div className="absolute right-3 top-3 text-error-500 pointer-events-none animate-scale-in">
            <AlertCircle size={16} />
          </div>
        )}
        {isSuccess && !isError && (
          <div className="absolute right-3 top-3 text-success-500 pointer-events-none animate-scale-in">
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

Textarea.displayName = 'Textarea';

export default Textarea;
