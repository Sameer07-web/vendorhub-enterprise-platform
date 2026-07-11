import React from 'react';

const VendorStatusBadge = ({ status }) => {
  const statusConfig = {
    Active: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    Inactive: { bg: 'bg-slate-100', text: 'text-slate-800' },
    Pending: { bg: 'bg-blue-100', text: 'text-blue-800' },
    Suspended: { bg: 'bg-red-100', text: 'text-red-800' },
  };

  const config = statusConfig[status] || statusConfig['Inactive'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
};

export default VendorStatusBadge;
