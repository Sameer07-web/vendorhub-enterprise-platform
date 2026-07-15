import React from 'react';
import { ArrowRight } from 'lucide-react';

const AuthButton = ({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  showArrow = false,
  isLoading = false,
  ...props
}) => {
  const baseStyles =
    "relative w-full h-[66px] rounded-[16px] font-semibold text-[22px] flex items-center justify-center transition-all duration-300";

  const variants = {
    primary: "bg-gradient-to-r from-[#2F6DF6] to-[#8B5CF6] text-white shadow-[0_12px_35px_rgba(59,130,246,0.45)] hover:brightness-110",
    secondary: "bg-[#FFFFFF05] border border-[#FFFFFF1A] text-[#FFFFFF] hover:bg-[#FFFFFF0A] hover:-translate-y-0.5 active:translate-y-0 focus:ring-[#FFFFFF33]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {Icon && !isLoading && <Icon size={18} />}
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <span>{children}</span>
      )}
      {showArrow && !isLoading && (
        <ArrowRight
          size={28}
          className="absolute right-8"
        />
      )}
    </button>
  );
};

export default AuthButton;
