import { formatDate } from '../../../utils/formatDate';
import { CheckCircle2, Clock, XCircle, FileEdit, Ban } from 'lucide-react';

const ApprovalTimeline = ({ purchaseRequest }) => {
  if (!purchaseRequest) return null;

  const { status, createdAt, submittedAt, approvedAt, approvedBy } = purchaseRequest;

  // Fallback mode without full approvalHistory array
  const steps = [
    {
      title: 'Created',
      description: 'Draft saved by creator',
      date: createdAt,
      icon: FileEdit,
      isCompleted: !!createdAt,
      statusColor: 'text-surface-500',
      bgColor: 'bg-surface-100'
    },
    {
      title: 'Submitted',
      description: 'Sent for approval',
      date: submittedAt,
      icon: Clock,
      isCompleted: !!submittedAt || status === 'APPROVED' || status === 'REJECTED',
      statusColor: 'text-primary-500',
      bgColor: 'bg-primary-100'
    }
  ];

  if (status === 'APPROVED') {
    steps.push({
      title: 'Approved',
      description: approvedBy?.fullName ? `by ${approvedBy.fullName}` : 'Approved by manager',
      date: approvedAt,
      icon: CheckCircle2,
      isCompleted: true,
      statusColor: 'text-emerald-500',
      bgColor: 'bg-emerald-100'
    });
  } else if (status === 'REJECTED') {
    steps.push({
      title: 'Rejected',
      description: approvedBy?.fullName ? `by ${approvedBy.fullName}` : 'Rejected by manager',
      date: approvedAt,
      icon: XCircle,
      isCompleted: true,
      statusColor: 'text-error-500',
      bgColor: 'bg-error-100'
    });
  } else if (status === 'CANCELLED') {
    steps.push({
      title: 'Cancelled',
      description: 'Request cancelled',
      date: null,
      icon: Ban,
      isCompleted: true,
      statusColor: 'text-orange-500',
      bgColor: 'bg-orange-100'
    });
  } else {
    // Pending step
    steps.push({
      title: 'Pending Approval',
      description: 'Awaiting manager review',
      date: null,
      icon: Clock,
      isCompleted: false,
      statusColor: 'text-surface-300',
      bgColor: 'bg-surface-50'
    });
  }

  return (
    <div className="relative pl-4 border-l-2 border-surface-200 space-y-6 mt-4 ml-2" aria-label="Approval Timeline">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={index} className="relative">
            <div className={`absolute -left-7 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${step.isCompleted ? step.bgColor : 'bg-surface-100'}`}>
              <Icon size={14} className={step.isCompleted ? step.statusColor : 'text-surface-400'} />
            </div>
            <div>
              <h4 className={`text-sm font-medium ${step.isCompleted ? 'text-surface-800' : 'text-surface-500'}`}>
                {step.title}
              </h4>
              <p className="text-xs text-surface-500 mt-0.5">{step.description}</p>
              {step.date && (
                <p className="text-xs text-surface-400 mt-1">
                  {formatDate(step.date, true)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalTimeline;
