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

const PurchaseRequestTable = ({ 
  purchaseRequests, 
  onSubmitClick, 
  onApproveClick, 
  onRejectClick, 
  onDeleteClick 
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200 sticky top-0">
          <tr>
            <th className="px-4 py-3 font-medium">Request Number</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Department</th>
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium text-center">Priority</th>
            <th className="px-4 py-3 font-medium text-center">Status</th>
            <th className="px-4 py-3 font-medium text-right">Est. Cost</th>
            <th className="px-4 py-3 font-medium">Required Date</th>
            <th className="px-4 py-3 font-medium">Created By</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {purchaseRequests.map((pr) => (
            <tr key={pr._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                {pr.requestNumber}
              </td>
              <td className="px-4 py-3 max-w-[200px] truncate" title={pr.title}>
                {pr.title}
              </td>
              <td className="px-4 py-3">{pr.department}</td>
              <td className="px-4 py-3 max-w-[150px] truncate" title={pr.vendor?.companyName}>
                {pr.vendor?.companyName || 'Unknown Vendor'}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  pr.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  pr.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                  pr.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {pr.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <PurchaseRequestStatusBadge status={pr.status} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                {formatCurrency(pr.estimatedCost, pr.currency)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(pr.requiredDate)}
              </td>
              <td className="px-4 py-3 max-w-[120px] truncate" title={pr.createdBy?.fullName}>
                {pr.createdBy?.fullName || 'Unknown'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link 
                    to={`/purchase-requests/${pr._id}`} 
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                    title="View Details"
                    aria-label={`View details for ${pr.requestNumber}`}
                  >
                    <Eye size={16} />
                  </Link>

                  {canEditPurchaseRequest(pr) && (
                    <Link 
                      to={`/purchase-requests/${pr._id}/edit`} 
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded hover:bg-emerald-50"
                      title="Edit Draft"
                      aria-label={`Edit ${pr.requestNumber}`}
                    >
                      <Edit size={16} />
                    </Link>
                  )}

                  {canSubmitPurchaseRequest(pr) && onSubmitClick && (
                    <button 
                      onClick={() => onSubmitClick(pr)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                      title="Submit Request"
                      aria-label={`Submit ${pr.requestNumber}`}
                    >
                      <Send size={16} />
                    </button>
                  )}

                  {canApprovePurchaseRequest() && pr.status === 'PENDING_APPROVAL' && onApproveClick && (
                    <button 
                      onClick={() => onApproveClick(pr)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded hover:bg-emerald-50"
                      title="Approve"
                      aria-label={`Approve ${pr.requestNumber}`}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}

                  {canRejectPurchaseRequest() && pr.status === 'PENDING_APPROVAL' && onRejectClick && (
                    <button 
                      onClick={() => onRejectClick(pr)}
                      className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                      title="Reject"
                      aria-label={`Reject ${pr.requestNumber}`}
                    >
                      <XCircle size={16} />
                    </button>
                  )}

                  {canDeletePurchaseRequest() && onDeleteClick && (
                    <button 
                      onClick={() => onDeleteClick(pr)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                      title="Delete"
                      aria-label={`Delete ${pr.requestNumber}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseRequestTable;
