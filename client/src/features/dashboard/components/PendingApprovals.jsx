import React from 'react';
import { Card, CardHeader, CardBody } from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import { Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PendingApprovals = ({ data = [] }) => {
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
            <div key={item.id} className="p-5 hover:bg-surface-50 transition-colors duration-150 flex flex-col gap-3">
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
                <span className="font-bold text-surface-900">{item.amount}</span>
                <div className="flex gap-2">
                  <button className="p-1.5 text-error-600 hover:bg-error-50 rounded-md transition-colors focus-ring" title="Reject">
                    <X size={16} />
                  </button>
                  <button className="p-1.5 text-success-600 hover:bg-success-50 rounded-md transition-colors focus-ring" title="Approve">
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
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
