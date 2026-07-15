import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({
  label,
  icon: Icon,
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-white/90 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#A1A1AA] group-focus-within:text-white transition-colors duration-150">
            <Icon size={20} strokeWidth={1.8} />
          </div>
        )}
        <input
          type={inputType}
          className={`
            w-full h-[66px] bg-[#FFFFFF08] border border-white/10 
            rounded-[18px] text-[#FFFFFF] placeholder-[#8B93A7] font-[400] text-[15px]
            focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50
            transition-all duration-150 hover:bg-[#FFFFFF14]
            ${Icon ? 'pl-[52px]' : 'pl-[16px]'}
            ${isPassword ? 'pr-[52px]' : 'pr-[16px]'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A1A1AA] hover:text-white transition-colors duration-150 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-error-400 font-medium ml-1 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};

export default AuthInput;
