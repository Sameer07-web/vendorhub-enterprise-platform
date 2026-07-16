import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, ShoppingCart } from 'lucide-react';
import { getPurchaseRequests, submitPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest, deletePurchaseRequest } from '../../../api/purchaseRequest.api';
import PurchaseRequestTable from '../components/PurchaseRequestTable';
import ApprovalDialog from '../components/ApprovalDialog';
import RejectDialog from '../components/RejectDialog';
import SearchBar from '../../../components/common/SearchBar';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import EmptyState from '../../../components/common/EmptyState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageHeader from '../../../components/common/PageHeader';
import { PR_STATUS, PR_PRIORITY, DEPARTMENTS } from '../../../utils/constants';

const PurchaseRequestList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedPr, setSelectedPr] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateUrlParams = useCallback((newParams) => {
    const current = Object.fromEntries(searchParams);
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach(key => {
      if (!updated[key]) delete updated[key];
    });
    setSearchParams(updated, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchPRs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPurchaseRequests({
        page,
        limit: 10,
        search,
        status,
        priority,
        department,
        sort
      });
      if (response.success) {
        setRequests(response.data.requests);
        setTotalPages(response.data.totalPages);
      }
    } catch {
      setError('Failed to load purchase requests. Please ensure the backend is available.');
      toast.error('Failed to fetch purchase requests');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, department, sort]);

  useEffect(() => {
    fetchPRs();
  }, [fetchPRs]);

  // Actions
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    updateUrlParams({ search: val, page: 1 });
  };

  const handleFilterChange = (filterName, val) => {
    if (filterName === 'status') setStatus(val);
    if (filterName === 'priority') setPriority(val);
    if (filterName === 'department') setDepartment(val);
    if (filterName === 'sort') setSort(val);
    setPage(1);
    updateUrlParams({ [filterName]: val, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setDepartment('');
    setPage(1);
    setSearchParams({});
  };

  const handleSubmitConfirm = async () => {
    try {
      setIsProcessing(true);
      await submitPurchaseRequest(selectedPr._id);
      toast.success('Request submitted successfully');
      setSubmitModalOpen(false);
      fetchPRs();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit request');
      setSubmitModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsProcessing(true);
      await deletePurchaseRequest(selectedPr._id);
      toast.success('Request deleted successfully');
      setDeleteModalOpen(false);
      if (requests.length === 1 && page > 1) {
        setPage(p => p - 1);
        updateUrlParams({ page: page - 1 });
      } else {
        fetchPRs();
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to delete request');
      setDeleteModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveConfirm = async (comments) => {
    try {
      setIsProcessing(true);
      await approvePurchaseRequest(selectedPr._id, comments);
      toast.success('Request approved successfully');
      setApproveModalOpen(false);
      fetchPRs();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (comments) => {
    try {
      setIsProcessing(true);
      await rejectPurchaseRequest(selectedPr._id, comments);
      toast.success('Request rejected successfully');
      setRejectModalOpen(false);
      fetchPRs();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const statusOptions = [{ value: '', label: 'All Statuses' }, ...Object.keys(PR_STATUS).map(s => ({ value: s, label: s.replace('_', ' ') }))];
  const priorityOptions = [{ value: '', label: 'All Priorities' }, ...Object.keys(PR_PRIORITY).map(p => ({ value: p, label: p }))];
  const deptOptions = [{ value: '', label: 'All Departments' }, ...DEPARTMENTS.map(d => ({ value: d, label: d }))];
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-priority', label: 'Priority (High to Low)' },
    { value: 'requiredDate', label: 'Required Date (Earliest)' },
    { value: '-estimatedCost', label: 'Estimated Cost (Highest)' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader 
        title="Purchase Requests"
        description="Manage and track organizational purchase requests."
        action={
          <Button onClick={() => navigate('/app/purchase-requests/new')} variant="primary" className="shrink-0 shadow-sm" startIcon={Plus}>
            Create Request
          </Button>
        }
      />

      <div className="bg-white p-5 rounded-lg shadow-sm border border-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1">
            <SearchBar 
              placeholder="Search request, title..." 
              onSearch={handleSearch} 
              initialValue={search}
            />
          </div>
          <Select 
            options={statusOptions} 
            value={status} 
            onChange={(e) => handleFilterChange('status', e.target.value)} 
            className="w-full"
          />
          <Select 
            options={priorityOptions} 
            value={priority} 
            onChange={(e) => handleFilterChange('priority', e.target.value)} 
            className="w-full"
          />
          <Select 
            options={deptOptions} 
            value={department} 
            onChange={(e) => handleFilterChange('department', e.target.value)} 
            className="w-full"
          />
          <Select 
            options={sortOptions} 
            value={sort} 
            onChange={(e) => handleFilterChange('sort', e.target.value)} 
            className="w-full"
          />
        </div>

        {(search || status || priority || department) && (
          <div className="flex justify-end animate-fade-in">
            <button 
              onClick={clearFilters}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors focus-ring rounded px-1"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {error ? (
        <EmptyState title="System Error" message={error} actionLabel="Try Again" onAction={fetchPRs} />
      ) : (
        <div className="flex flex-col gap-4">
          {requests.length === 0 && !loading ? (
            <EmptyState 
              title="No purchase requests found" 
              message="We couldn't find any purchase requests matching your criteria."
              icon={ShoppingCart}
              actionLabel="Create Purchase Request"
              onAction={() => navigate('/app/purchase-requests/new')}
              secondaryActionLabel={(search || status || priority || department) ? "Clear Filters" : undefined}
              onSecondaryAction={(search || status || priority || department) ? clearFilters : undefined}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <PurchaseRequestTable 
                purchaseRequests={requests}
                isLoading={loading}
                onSubmitClick={(pr) => { setSelectedPr(pr); setSubmitModalOpen(true); }}
                onApproveClick={(pr) => { setSelectedPr(pr); setApproveModalOpen(true); }}
                onRejectClick={(pr) => { setSelectedPr(pr); setRejectModalOpen(true); }}
                onDeleteClick={(pr) => { setSelectedPr(pr); setDeleteModalOpen(true); }}
              />
            </div>
          )}
          {!loading && requests.length > 0 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Request"
        message={`Are you sure you want to delete ${selectedPr?.requestNumber}? This action can be restored by an administrator.`}
        confirmText="Delete Request"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={handleSubmitConfirm}
        title="Submit Purchase Request"
        message={`Are you sure you want to submit ${selectedPr?.requestNumber} for approval? You will no longer be able to edit it.`}
        confirmText="Submit for Approval"
        variant="primary"
        isLoading={isProcessing}
      />

      <ApprovalDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        isSubmitting={isProcessing}
        title={`Approve ${selectedPr?.requestNumber}`}
      />
      <RejectDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isSubmitting={isProcessing}
        title={`Reject ${selectedPr?.requestNumber}`}
      />
    </div>
  );
};

export default PurchaseRequestList;
