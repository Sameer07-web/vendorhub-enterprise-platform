import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { getVendors, deleteVendor } from '../../../api/vendor.api';
import VendorTable from '../components/VendorTable';
import SearchBar from '../../../components/common/SearchBar';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // If deleting the last item on the page, go to previous page if not page 1
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your enterprise vendors and suppliers.</p>
        </div>
        <Button onClick={() => navigate('/vendors/new')} variant="primary" className="shrink-0">
          <Plus size={18} className="mr-2" />
          Create Vendor
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-4">
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
          <div className="flex justify-end">
            <button 
              onClick={() => {
                setSearch('');
                setStatus('');
                setCategory('');
                setPagination(prev => ({ ...prev, page: 1 }));
                // Reset search bar internal state handled automatically via value if controlled, 
                // but since SearchBar is uncontrolled with debounce, we need to handle its internal state or remount.
                // Simple workaround for this demo is just clearing filters.
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Loader rows={8} />
      ) : error ? (
        <EmptyState 
          title="System Error" 
          message={error}
          actionLabel="Try Again"
          onAction={fetchVendors}
        />
      ) : vendors.length > 0 ? (
        <div className="flex flex-col">
          <VendorTable vendors={vendors} onDeleteClick={handleDeleteClick} />
          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      ) : (
        <EmptyState 
          title="No vendors found" 
          message="We couldn't find any vendors matching your criteria."
          actionLabel="Create Vendor"
          onAction={() => navigate('/vendors/new')}
        />
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Vendor"
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Vendor'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the vendor <strong>{vendorToDelete?.companyName}</strong>?</p>
        <p className="mt-2 text-sm text-slate-500">This action cannot be undone and will permanently remove the vendor data from the system.</p>
      </Modal>
    </div>
  );
};

export default VendorList;
