import { CheckCircle2, Clock, XCircle, Send, FileText, Check } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';

const getStatusIcon = (status) => {
  switch (status) {
    case 'DRAFT': return <FileText size={16} />;
    case 'SENT': return <Send size={16} />;
    case 'PARTIALLY_RESPONDED': return <Clock size={16} />;
    case 'CLOSED': return <CheckCircle2 size={16} />;
    case 'CANCELLED': return <XCircle size={16} />;
    default: return <Clock size={16} />;
  }
};

const getStatusColor = (status, isCurrent) => {
  if (status === 'CANCELLED') return isCurrent ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500';
  if (status === 'CLOSED') return isCurrent ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-500';
  if (status === 'SENT') return isCurrent ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500';
  if (status === 'PARTIALLY_RESPONDED') return isCurrent ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-500';
  return isCurrent ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500';
};

const RFQTimeline = ({ rfq }) => {
  if (!rfq) return null;

  const history = rfq.statusHistory || [];
  
  if (history.length === 0) {
    // Fallback if no history
    return (
      <div className="relative pl-8 pb-4">
        <div className="absolute left-3 top-1 bottom-0 w-0.5 bg-slate-200"></div>
        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center z-10 ring-4 ring-white">
          <FileText size={12} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900">Draft Created</span>
          <span className="text-xs text-slate-500">{formatDate(rfq.createdAt, true)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((event, index) => {
        const isLast = index === history.length - 1;
        const isCurrent = isLast && rfq.status === event.status;
        
        return (
          <div key={index} className={`relative pl-8 ${isLast ? '' : 'pb-6'}`}>
            {!isLast && <div className="absolute left-3 top-1 bottom-0 w-0.5 bg-slate-200"></div>}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ring-4 ring-white ${getStatusColor(event.status, isCurrent)}`}>
              {isCurrent && event.status === 'CLOSED' ? <Check size={12} /> : getStatusIcon(event.status)}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>
                {event.status.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center text-xs text-slate-500 mt-0.5">
                <span>{formatDate(event.changedAt, true)}</span>
                {event.changedBy && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{event.changedBy.fullName || 'System'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RFQTimeline;
