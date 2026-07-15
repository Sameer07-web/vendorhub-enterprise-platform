import React from 'react';

export const Card = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`card-base overflow-hidden ${className}`}>
      {!noPadding && <div className="p-6">{children}</div>}
      {noPadding && children}
    </div>
  );
};

export const CardHeader = ({ title, description, action, className = '' }) => {
  return (
    <div className={`px-6 py-5 border-b border-border flex items-center justify-between ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-surface-900 leading-none">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-surface-500 leading-none">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-border bg-surface-50/50 flex items-center ${className}`}>
      {children}
    </div>
  );
};
