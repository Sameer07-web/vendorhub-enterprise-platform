import React from 'react';

const FormSection = ({ title, description, children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 border-b border-surface-200 pb-8 mb-8 last:border-0 last:pb-0 last:mb-0 ${className}`}>
      <div className="lg:col-span-1">
        <h3 className="text-lg font-bold text-surface-900 tracking-tight">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-surface-500 leading-relaxed">{description}</p>}
      </div>
      <div className="lg:col-span-2 space-y-5">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
