import { formatDate } from '../../../utils/formatDate';
import { CheckCircle2, Clock, XCircle, FileEdit } from 'lucide-react';

const ApprovalTimeline = ({ purchaseRequest }) => {
  if (!purchaseRequest) return null;

  const { timeline, status } = purchaseRequest;

  // Render the timeline from the array if available
  if (timeline && timeline.length > 0) {
    return (
      <div className="relative pl-4 border-l-2 border-surface-200 space-y-6 mt-4 ml-2" aria-label="Approval Timeline">
        {timeline.map((item, index) => {
          let Icon = Clock;
          let bgColor = 'bg-surface-100';
          let statusColor = 'text-surface-500';

          if (item.status === 'Draft') {
            Icon = FileEdit;
            bgColor = 'bg-surface-100';
            statusColor = 'text-surface-500';
          } else if (item.status === 'Submitted') {
            Icon = Clock;
            bgColor = 'bg-primary-100';
            statusColor = 'text-primary-500';
          } else if (item.status === 'Approved') {
            Icon = CheckCircle2;
            bgColor = 'bg-emerald-100';
            statusColor = 'text-emerald-500';
          } else if (item.status === 'Rejected') {
            Icon = XCircle;
            bgColor = 'bg-error-100';
            statusColor = 'text-error-500';
          }

          return (
            <div key={item.id || index} className="relative">
              <div className={`absolute -left-7 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${bgColor}`}>
                <Icon size={14} className={statusColor} />
              </div>
              <div>
                <h4 className={`text-sm font-medium text-surface-800`}>
                  {item.status}
                </h4>
                <p className="text-xs text-surface-500 mt-0.5">{item.message}</p>
                {item.timestamp && (
                  <p className="text-xs text-surface-400 mt-1">
                    {formatDate(item.timestamp, true)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {/* Pending state indicator */}
        {status === 'Pending Approval' && (
          <div className="relative">
            <div className="absolute -left-7 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm bg-surface-50">
              <Clock size={14} className="text-surface-300" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-surface-400">
                Pending Approval
              </h4>
              <p className="text-xs text-surface-400 mt-0.5">Awaiting manager review</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-sm text-surface-500 italic p-4 bg-surface-50 rounded-md border border-surface-200">
      Timeline data not available.
    </div>
  );
};

export default ApprovalTimeline;
