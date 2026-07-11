import { getStatusColor } from '../../../utils/statusColors';

const PurchaseRequestStatusBadge = ({ status }) => {
  const colorClasses = getStatusColor(status);
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
      {status?.replace('_', ' ') || 'UNKNOWN'}
    </span>
  );
};

export default PurchaseRequestStatusBadge;
