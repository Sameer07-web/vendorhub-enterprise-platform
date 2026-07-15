import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { getVendors, deleteVendor } from '../../../api/vendor.api';
import Table from '../../../components/common/Table';
import VendorStatusBadge from '../components/VendorStatusBadge';
import SearchBar from '../../../components/common/SearchBar';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';

const VendorList = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt'); // Default newest

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status,
        category,
        sort
      };
      
      const response = await getVendors(params);
      if (response.success) {
        setVendors(response.data.vendors);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
      }
    } catch {
      setError('Failed to load vendors. Please ensure the backend is available and try again.');
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status, category, sort]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteVendor(vendorToDelete._id);
      toast.success('Vendor deleted successfully');
      setDeleteModalOpen(false);
      setVendorToDelete(null);
      if (vendors.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        fetchVendors();
      }
    } catch {
      toast.error('Failed to delete vendor');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  const categoryOptions = [
    { value: 'IT Equipment', label: 'IT Equipment' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Logistics', label: 'Logistics' },
    { value: 'Other', label: 'Other' },
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'companyName', label: 'Company Name (A-Z)' },
    { value: '-companyName', label: 'Company Name (Z-A)' },
    { value: '-rating', label: 'Highest Rating' },
  ];

  const vendorColumns = [
    {
      key: 'vendor',
      label: 'Vendor',
      render: (row) => (
        <div className="flex flex-col">
          <Link to={`/vendors/${row._id}`} className="text-sm font-semibold text-surface-900 hover:text-primary-600 focus-ring rounded transition-colors w-max">
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
      label: 'Actions',
      align: 'right',
      stickyRight: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <Link 
            to={`/vendors/${row._id}`} 
            className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors focus-ring"
            title="View Details"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={18} />
          </Link>
          <Link 
            to={`/vendors/${row._id}/edit`} 
            className="p-1.5 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-md transition-colors focus-ring"
            title="Edit Vendor"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit size={18} />
          </Link>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }} 
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
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Vendors</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your enterprise vendors and suppliers.</p>
        </div>
        <Button onClick={() => navigate('/app/vendors/new')} variant="primary" className="shrink-0 shadow-sm" startIcon={Plus}>
          Create Vendor
        </Button>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <SearchBar 
              placeholder="Search by code, name, email..." 
              onSearch={(val) => { setSearch(val); setPagination(prev => ({ ...prev, page: 1 })); }} 
            />
          </div>
          <Select 
            options={statusOptions} 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }} 
            className="w-full"
          />
          <Select 
            options={categoryOptions} 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }} 
            className="w-full"
          />
          <Select 
            options={sortOptions} 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }} 
            className="w-full"
          />
        </div>

        {(search || status || category) && (
          <div className="flex justify-end animate-fade-in">
            <button 
              onClick={() => {
                setSearch('');
                setStatus('');
                setCategory('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors focus-ring rounded px-1"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {error ? (
        <EmptyState 
          title="System Error" 
          message={error}
          actionLabel="Try Again"
          onAction={fetchVendors}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Table 
            columns={vendorColumns}
            data={vendors}
            isLoading={loading}
            loadingRows={5}
            emptyState={
              <EmptyState 
                title="No vendors found" 
                message="We couldn't find any vendors matching your criteria. Try adjusting your filters or add a new vendor."
                icon={Users}
                actionLabel="Create Vendor"
                onAction={() => navigate('/app/vendors/new')}
                secondaryActionLabel={(search || status || category) ? "Clear Filters" : undefined}
                onSecondaryAction={(search || status || category) ? () => {
                  setSearch('');
                  setStatus('');
                  setCategory('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                } : undefined}
              />
            }
          />
          {!loading && vendors.length > 0 && (
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Vendor"
        size="sm"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={isDeleting}>
              Delete Vendor
            </Button>
          </>
        }
      >
        <p className="text-sm">Are you sure you want to delete <strong>{vendorToDelete?.companyName}</strong>?</p>
        <p className="mt-3 text-sm text-surface-500 bg-surface-50 p-3 rounded-md border border-border">
          This action cannot be undone and will permanently remove all associated vendor data.
        </p>
      </Modal>
    </div>
  );
};

export default VendorList;

