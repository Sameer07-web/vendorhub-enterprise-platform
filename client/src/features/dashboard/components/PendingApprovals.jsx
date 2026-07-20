import React from 'react';
import { Card, CardHeader, CardBody } from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatCurrency';

const PendingApprovals = ({ data = [] }) => {
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader 
        title="Pending Approvals" 
        action={
          <Link to="/app/purchase-requests/approval" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 focus-ring rounded transition-colors">
            View queue <ArrowRight size={16} />
          </Link>
        }
      />
      <CardBody className="p-0">
        <div className="divide-y divide-surface-200">
          {data.map((item) => (
            <div key={item.id || item._id} className="p-5 hover:bg-surface-50 transition-colors duration-150 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-semibold text-surface-900 text-sm leading-tight">{item.title}</h4>
                  <p className="text-xs text-surface-500 mt-1">{item.requester} • {item.department}</p>
                </div>
                <Badge variant={item.urgency === 'Critical' ? 'error' : item.urgency === 'High' ? 'warning' : 'secondary'} size="sm">
                  {item.urgency}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <span className="font-bold text-surface-900">{typeof item.amount === 'number' ? formatCurrency(item.amount) : item.amount}</span>
                <span className="text-xs text-surface-400">{formatTimeAgo(item.date)}</span>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="p-8 text-center text-surface-500 text-sm">
              No pending approvals in your queue.
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PendingApprovals;
