import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
  title = 'No data found', 
  message = 'There is no data to display.', 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon: Icon = PackageOpen 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-xl border border-border shadow-subtle animate-fade-in w-full">
      
      {/* Layered Icon Background for Enterprise Polish */}
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-primary-100 rounded-full scale-150 blur-xl opacity-40 transition-transform duration-700 group-hover:scale-125"></div>
        <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-white text-primary-600 shadow-sm border border-primary-100/60 z-10">
          <Icon size={36} strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-surface-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-surface-500 mb-8 max-w-sm leading-relaxed">{message}</p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 animate-slide-up">
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="secondary">
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && onAction && (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

