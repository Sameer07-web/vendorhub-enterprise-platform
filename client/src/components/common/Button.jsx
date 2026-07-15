import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  startIcon: StartIcon,
  endIcon: EndIcon,
  disabled,
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus-ring disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm border border-transparent',
    secondary: 'bg-white text-surface-700 border border-border hover:border-surface-300 hover:bg-surface-50 shadow-sm',
    danger: 'bg-error-600 text-white hover:bg-error-700 shadow-sm border border-transparent',
    ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 border border-transparent',
    link: 'text-primary-600 hover:text-primary-700 hover:underline p-0 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  };

  const isLink = variant === 'link';
  const finalSize = isLink ? '' : sizes[size];
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${finalSize} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
      )}
      {!isLoading && StartIcon && (
        <StartIcon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
      <span className={isLoading ? 'opacity-90' : ''}>
        {children}
      </span>
      {!isLoading && EndIcon && (
        <EndIcon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
    </button>
  );
};

export default Button;

