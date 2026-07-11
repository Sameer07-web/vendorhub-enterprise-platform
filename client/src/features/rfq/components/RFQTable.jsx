import { Link } from 'react-router-dom';
import { Eye, Edit, Send, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import RFQStatusBadge from './RFQStatusBadge';
import { canEditRFQ, canSendRFQ, canCloseRFQ, canCancelRFQ } from '../../../utils/permissions';

const RFQTable = ({ 
  rfqs = [], 
  onSendClick,
  onCloseClick,
  onCancelClick 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                RFQ Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Vendors / Responses
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Deadline
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created By
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {rfqs.map((rfq) => (
              <tr key={rfq._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-blue-600">
                      <Link to={`/rfqs/${rfq._id}`}>{rfq.rfqNumber}</Link>
                    </span>
                    <span className="text-sm font-medium text-slate-900 mt-0.5">{rfq.title}</span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      PR: {rfq.purchaseRequestSnapshot?.requestNumber || rfq.purchaseRequest?.requestNumber}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RFQStatusBadge status={rfq.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-900">{rfq.vendorResponses?.totalVendors || 0} Vendors</span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {rfq.vendorResponses?.responded || 0} Responded
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${new Date(rfq.quotationDeadline) < new Date() && !['CLOSED', 'CANCELLED'].includes(rfq.status) ? 'text-red-600 font-medium' : 'text-slate-900'}`}>
                    {formatDate(rfq.quotationDeadline)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-900">{rfq.createdBy?.fullName}</span>
                    <span className="text-xs text-slate-500">{formatDate(rfq.createdAt, true)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    <Link
                      to={`/rfqs/${rfq._id}`}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </Link>
                    
                    {canEditRFQ(rfq) && (
                      <Link
                        to={`/rfqs/${rfq._id}/edit`}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Edit Draft"
                      >
                        <Edit size={18} />
                      </Link>
                    )}

                    {canSendRFQ(rfq) && (
                      <button
                        onClick={() => onSendClick(rfq)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Send RFQ"
                      >
                        <Send size={18} />
                      </button>
                    )}

                    {canCloseRFQ(rfq) && (
                      <button
                        onClick={() => onCloseClick(rfq)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                        title="Close RFQ"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}

                    {canCancelRFQ(rfq) && (
                      <button
                        onClick={() => onCancelClick(rfq)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Cancel RFQ"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RFQTable;
