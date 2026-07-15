import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Send, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import RFQStatusBadge from './RFQStatusBadge';
import { canEditRFQ, canSendRFQ, canCloseRFQ, canCancelRFQ } from '../../../utils/permissions';
import Table from '../../../components/common/Table';

const RFQTable = ({ 
  rfqs = [], 
  onSendClick,
  onCloseClick,
  onCancelClick,
  isLoading
}) => {

  const columns = [
    {
      key: 'details',
      label: 'RFQ Details',
      render: (rfq) => (
        <div className="flex flex-col">
          <Link to={`/rfqs/${rfq._id}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700 focus-ring rounded w-max">
            {rfq.rfqNumber}
          </Link>
          <span className="text-sm font-medium text-surface-900 mt-0.5">{rfq.title}</span>
          <span className="text-xs text-surface-500 mt-0.5">
            PR: {rfq.purchaseRequestSnapshot?.requestNumber || rfq.purchaseRequest?.requestNumber}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (rfq) => <RFQStatusBadge status={rfq.status} />
    },
    {
      key: 'responses',
      label: 'Vendors / Responses',
      align: 'center',
      render: (rfq) => (
        <div className="flex flex-col items-center">
          <span className="text-sm text-surface-900 font-medium">{rfq.vendorResponses?.totalVendors || 0} Vendors</span>
          <span className="text-xs text-surface-500 mt-0.5">
            {rfq.vendorResponses?.responded || 0} Responded
          </span>
        </div>
      )
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (rfq) => (
        <span className={`text-sm ${new Date(rfq.quotationDeadline) < new Date() && !['CLOSED', 'CANCELLED'].includes(rfq.status) ? 'text-error-600 font-medium' : 'text-surface-900'}`}>
          {formatDate(rfq.quotationDeadline)}
        </span>
      )
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (rfq) => (
        <div className="flex flex-col">
          <span className="text-sm text-surface-900">{rfq.createdBy?.fullName}</span>
          <span className="text-xs text-surface-500">{formatDate(rfq.createdAt, true)}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      stickyRight: true,
      render: (rfq) => (
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <Link
            to={`/rfqs/${rfq._id}`}
            className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors focus-ring"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
          
          {canEditRFQ(rfq) && (
            <Link
              to={`/rfqs/${rfq._id}/edit`}
              className="p-1.5 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-md transition-colors focus-ring"
              title="Edit Draft"
            >
              <Edit size={18} />
            </Link>
          )}

          {canSendRFQ(rfq) && (
            <button
              onClick={() => onSendClick(rfq)}
              className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors focus-ring"
              title="Send RFQ"
            >
              <Send size={18} />
            </button>
          )}

          {canCloseRFQ(rfq) && (
            <button
              onClick={() => onCloseClick(rfq)}
              className="p-1.5 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-md transition-colors focus-ring"
              title="Close RFQ"
            >
              <CheckCircle size={18} />
            </button>
          )}

          {canCancelRFQ(rfq) && (
            <button
              onClick={() => onCancelClick(rfq)}
              className="p-1.5 text-surface-400 hover:text-error-600 hover:bg-error-50 rounded-md transition-colors focus-ring"
              title="Cancel RFQ"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <Table 
      columns={columns}
      data={rfqs}
      isLoading={isLoading}
    />
  );
};

export default RFQTable;

