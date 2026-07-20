import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Users } from 'lucide-react';
import { getVendors, deleteVendor } from '../../../api/vendor.api';
import VendorTable from '../components/VendorTable';
import SearchBar from '../../../components/common/SearchBar';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import EmptyState from '../../../components/common/EmptyState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageHeader from '../../../components/common/PageHeader';

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
    { value: '', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'IT Equipment', label: 'IT Equipment' },
    { value: 'Software', label: 'Software' },
    { value: 'Hardware', label: 'Hardware' },
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Vendors"
        description="Manage your enterprise vendors and suppliers."
        action={
          <Button onClick={() => navigate('/app/vendors/new')} variant="primary" className="shrink-0 shadow-sm" startIcon={Plus}>
            Create Vendor
          </Button>
        }
      />

      <div className="bg-white p-5 rounded-lg shadow-sm border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <SearchBar
              placeholder="Search vendors..."
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
          {vendors.length === 0 && !loading ? (
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
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <VendorTable
                vendors={vendors}
                isLoading={loading}
                onRowClick={(row) => navigate(`/app/vendors/${row._id}`)}
                onDeleteClick={handleDeleteClick}
              />
            </div>
          )}
          {!loading && vendors.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${vendorToDelete?.companyName}? This action cannot be undone and will permanently remove all associated vendor data.`}
        confirmText="Delete Vendor"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default VendorList;
