import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, actions, size = 'md' }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[90vw]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        className={`relative bg-white rounded-xl shadow-floating w-full ${sizeClasses[size]} overflow-hidden flex flex-col max-h-full transform transition-all`}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
          <h3 id="modal-title" className="text-lg font-semibold text-surface-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors focus-ring">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 text-surface-600 overflow-y-auto">
          {children}
        </div>
        {actions && (
          <div className="px-6 py-4 bg-surface-50/80 border-t border-border flex justify-end gap-3 rounded-b-xl">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
