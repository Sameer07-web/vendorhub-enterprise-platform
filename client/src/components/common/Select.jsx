import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Select = forwardRef(({ label, error, success, helperText, required, options, className = '', icon: Icon, ...props }, ref) => {
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <select
          ref={ref}
          required={required}
          aria-invalid={isError ? "true" : "false"}
          className={`block w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none disabled:bg-surface-50 disabled:text-surface-500 disabled:cursor-not-allowed appearance-none
            ${Icon ? 'pl-9' : ''}
            ${(isError || isSuccess) ? 'pr-9' : ''}
            ${isError 
              ? 'border-error-500 focus-visible:ring-2 focus-visible:ring-error-500/30 focus-visible:border-error-500 bg-error-50/10' 
              : isSuccess 
                ? 'border-success-500 focus-visible:ring-2 focus-visible:ring-success-500/30 focus-visible:border-success-500 bg-success-50/10' 
                : 'border-border focus-ring hover:border-border-hover'}
            ${className}`}
          {...props}
        >
          {label && <option value="" disabled>Select {label}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Caret or Status Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
          {isError && <AlertCircle size={16} className="text-error-500 animate-scale-in" />}
          {isSuccess && !isError && <CheckCircle size={16} className="text-success-500 animate-scale-in" />}
          
          {/* Custom dropdown arrow */}
          <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error ? (
        <p className="text-xs font-medium text-error-600 animate-slide-up" role="alert">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-surface-500 animate-fade-in">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

