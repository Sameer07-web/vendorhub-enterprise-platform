import { getStatusColor } from '../../../utils/statusColors';

const RFQStatusBadge = ({ status }) => {
  const colorClass = getStatusColor(status);
  // format string, e.g. PARTIALLY_RESPONDED -> Partially Responded
  const displayStatus = status
    ? status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    : 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {displayStatus}
    </span>
  );
};

export default RFQStatusBadge;
