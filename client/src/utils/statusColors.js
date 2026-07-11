export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'PENDING_APPROVAL':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'CANCELLED':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
