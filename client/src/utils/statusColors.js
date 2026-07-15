export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'bg-surface-100 text-surface-800 border-surface-200';
    case 'PENDING_APPROVAL':
      return 'bg-primary-100 text-primary-800 border-primary-200';
    case 'SENT':
      return 'bg-primary-100 text-primary-800 border-primary-200';
    case 'PARTIALLY_RESPONDED':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'APPROVED':
    case 'CLOSED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'REJECTED':
      return 'bg-error-100 text-error-800 border-error-200';
    case 'CANCELLED':
      return 'bg-error-100 text-error-800 border-error-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
