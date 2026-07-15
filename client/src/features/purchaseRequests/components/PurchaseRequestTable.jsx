import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Send, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import PurchaseRequestStatusBadge from './PurchaseRequestStatusBadge';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { 
  canEditPurchaseRequest, 
  canSubmitPurchaseRequest, 
  canApprovePurchaseRequest, 
  canRejectPurchaseRequest, 
  canDeletePurchaseRequest 
} from '../../../utils/permissions';
import Badge from '../../../components/common/Badge';
import Table from '../../../components/common/Table';

const PurchaseRequestTable = ({ 
  purchaseRequests, 
  onSubmitClick, 
  onApproveClick, 
  onRejectClick, 
  onDeleteClick,
  isLoading
}) => {

  const columns = [
    {
      key: 'request',
      label: 'Request',
      render: (pr) => (
        <div className="flex flex-col max-w-[250px]">
          <Link to={`/purchase-requests/${pr._id}`} className="text-sm font-semibold text-surface-900 hover:text-primary-600 transition-colors truncate focus-ring rounded" title={pr.title}>
            {pr.title}
          </Link>
          <span className="text-xs text-surface-500 font-medium mt-0.5">{pr.requestNumber}</span>
        </div>
      )
    },
    {
      key: 'departmentVendor',
      label: 'Department & Vendor',
      render: (pr) => (
        <div className="flex flex-col">
          <span className="text-sm text-surface-700 font-medium">{pr.department}</span>
          <span className="text-xs text-surface-500 truncate max-w-[200px]" title={pr.vendor?.companyName}>
            {pr.vendor?.companyName || 'Vendor TBD'}
          </span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      align: 'center',
      render: (pr) => (
        <Badge variant={
          pr.priority === 'CRITICAL' ? 'danger' :
          pr.priority === 'HIGH' ? 'warning' :
          pr.priority === 'MEDIUM' ? 'primary' :
          'default'
        }>
          {pr.priority}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (pr) => <PurchaseRequestStatusBadge status={pr.status} />
    },
    {
      key: 'estCost',
      label: 'Est. Cost',
      align: 'right',
      render: (pr) => (
        <div className="text-sm font-semibold text-surface-900 tabular-nums">
          {formatCurrency(pr.estimatedCost, pr.currency)}
        </div>
      )
    },
    {
      key: 'timeline',
      label: 'Timeline',
      render: (pr) => (
        <div className="flex flex-col">
          <span className="text-sm text-surface-600">Req: {formatDate(pr.requiredDate)}</span>
          <span className="text-xs text-surface-500 mt-0.5 truncate max-w-[150px]" title={pr.createdBy?.fullName}>By: {pr.createdBy?.fullName || 'System'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      stickyRight: true,
      render: (pr) => (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <Link 
            to={`/purchase-requests/${pr._id}`} 
            className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors focus-ring"
            title="View Details"
          >
            <Eye size={18} />
          </Link>

          {canEditPurchaseRequest(pr) && (
            <Link 
              to={`/purchase-requests/${pr._id}/edit`} 
              className="p-1.5 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-md transition-colors focus-ring"
              title="Edit Draft"
            >
              <Edit size={18} />
            </Link>
          )}

          {canSubmitPurchaseRequest(pr) && onSubmitClick && (
            <button 
              onClick={() => onSubmitClick(pr)}
              className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors focus-ring"
              title="Submit Request"
            >
              <Send size={18} />
            </button>
          )}

          {canApprovePurchaseRequest() && pr.status === 'PENDING_APPROVAL' && onApproveClick && (
            <button 
              onClick={() => onApproveClick(pr)}
              className="p-1.5 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-md transition-colors focus-ring"
              title="Approve"
            >
              <CheckCircle size={18} />
            </button>
          )}

          {canRejectPurchaseRequest() && pr.status === 'PENDING_APPROVAL' && onRejectClick && (
            <button 
              onClick={() => onRejectClick(pr)}
              className="p-1.5 text-surface-400 hover:text-warning-600 hover:bg-warning-50 rounded-md transition-colors focus-ring"
              title="Reject"
            >
              <XCircle size={18} />
            </button>
          )}

          {canDeletePurchaseRequest() && onDeleteClick && (
            <button 
              onClick={() => onDeleteClick(pr)}
              className="p-1.5 text-surface-400 hover:text-error-600 hover:bg-error-50 rounded-md transition-colors focus-ring"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      data={purchaseRequests} 
      isLoading={isLoading} 
    />
  );
};

export default PurchaseRequestTable;

