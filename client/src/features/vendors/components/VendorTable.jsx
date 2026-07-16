import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Table from '../../../components/common/Table';
import VendorStatusBadge from './VendorStatusBadge';

const VendorTable = ({ vendors, isLoading, onRowClick, onDeleteClick }) => {
  const columns = [
    {
      key: 'vendor',
      label: 'Vendor',
      render: (row) => (
        <div className="flex flex-col">
          <Link to={`/app/vendors/${row._id}`} className="text-sm font-semibold text-surface-900 hover:text-primary-600 focus-ring rounded transition-colors w-max" onClick={e => e.stopPropagation()}>
            {row.companyName}
          </Link>
          <span className="text-xs text-surface-500 font-medium mt-0.5">{row.vendorCode}</span>
        </div>
      )
    },
    { key: 'contactPerson', label: 'Contact Person', render: (row) => <span className="font-medium text-surface-600">{row.contactPerson}</span> },
    { key: 'vendorCategory', label: 'Category', render: (row) => <span className="text-surface-600">{row.vendorCategory}</span> },
    { key: 'status', label: 'Status', render: (row) => <VendorStatusBadge status={row.status} /> },
    { key: 'rating', label: 'Rating', align: 'center', render: (row) => <span className="font-medium text-surface-600">{row.rating ? `${row.rating}/5` : '—'}</span> },
    { 
      key: 'createdAt', 
      label: 'Created', 
      align: 'right',
      render: (row) => <span className="text-surface-500">{new Date(row.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span> 
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      stickyRight: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <Link 
            to={`/app/vendors/${row._id}`} 
            className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors focus-ring"
            title="View Details"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={18} />
          </Link>
          <Link 
            to={`/app/vendors/${row._id}/edit`} 
            className="p-1.5 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-md transition-colors focus-ring"
            title="Edit Vendor"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit size={18} />
          </Link>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteClick(row); }} 
            className="p-1.5 text-surface-400 hover:text-error-600 hover:bg-error-50 rounded-md transition-colors focus-ring"
            title="Delete Vendor"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <Table 
      columns={columns}
      data={vendors}
      isLoading={isLoading}
      loadingRows={5}
      onRowClick={onRowClick}
    />
  );
};

export default VendorTable;
