import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { getPurchaseRequests, submitPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest, deletePurchaseRequest } from '../../../api/purchaseRequest.api';
import PurchaseRequestTable from '../components/PurchaseRequestTable';
import ApprovalDialog from '../components/ApprovalDialog';
import RejectDialog from '../components/RejectDialog';
import SearchBar from '../../../components/common/SearchBar';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';
import { PR_STATUS, PR_PRIORITY, DEPARTMENTS } from '../../../utils/constants';
import { canCreatePurchaseRequest, isAdmin } from '../../../utils/permissions';

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

  // Sync state to URL when changed (Debounced internally for search by the SearchBar itself passing via onSearch, but we update URL directly)
  const updateUrlParams = useCallback((newParams) => {
    const current = Object.fromEntries(searchParams);
    const updated = { ...current, ...newParams };
    // Remove empty params
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
        setRequests(response.data.purchaseRequests);
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

  // Submit Action
  const handleSubmitConfirm = async () => {
    try {
      setIsProcessing(true);
      await submitPurchaseRequest(selectedPr._id);
      toast.success('Request submitted successfully');
      setSubmitModalOpen(false);
      fetchPRs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
      setSubmitModalOpen(false); // Can close on submit failure or keep open. User spec: Keep open on approval failure. Let's close on submit.
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete Action
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
      toast.error(err?.response?.data?.message || 'Failed to delete request');
      setDeleteModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve Action
  const handleApproveConfirm = async (comments) => {
    try {
      setIsProcessing(true);
      await approvePurchaseRequest(selectedPr._id, comments);
      toast.success('Request approved successfully');
      setApproveModalOpen(false);
      fetchPRs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve request');
      // Per spec: "Approval action failure Keep dialog open. Display error."
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject Action
  const handleRejectConfirm = async (comments) => {
    try {
      setIsProcessing(true);
      await rejectPurchaseRequest(selectedPr._id, comments);
      toast.success('Request rejected successfully');
      setRejectModalOpen(false);
      fetchPRs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const statusOptions = Object.keys(PR_STATUS).map(s => ({ value: s, label: s.replace('_', ' ') }));
  const priorityOptions = Object.keys(PR_PRIORITY).map(p => ({ value: p, label: p }));
  const deptOptions = DEPARTMENTS.map(d => ({ value: d, label: d }));
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-priority', label: 'Priority (High to Low)' },
    { value: 'requiredDate', label: 'Required Date (Earliest)' },
    { value: '-estimatedCost', label: 'Estimated Cost (Highest)' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track organizational purchase requests.</p>
        </div>
        {canCreatePurchaseRequest() && (
          <Button onClick={() => navigate('/purchase-requests/new')} variant="primary" className="shrink-0">
            <Plus size={18} className="mr-2" />
            Create Request
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-4">
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
            label=""
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
          <div className="flex justify-end">
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Loader rows={8} />
      ) : error ? (
        <EmptyState title="System Error" message={error} actionLabel="Try Again" onAction={fetchPRs} />
      ) : requests.length > 0 ? (
        <div className="flex flex-col">
          <PurchaseRequestTable 
            purchaseRequests={requests} 
            onSubmitClick={(pr) => { setSelectedPr(pr); setSubmitModalOpen(true); }}
            onApproveClick={(pr) => { setSelectedPr(pr); setApproveModalOpen(true); }}
            onRejectClick={(pr) => { setSelectedPr(pr); setRejectModalOpen(true); }}
            onDeleteClick={isAdmin() ? (pr) => { setSelectedPr(pr); setDeleteModalOpen(true); } : undefined}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      ) : (
        <EmptyState 
          title="No purchase requests found" 
          message="We couldn't find any purchase requests matching your criteria."
          actionLabel="Create Purchase Request"
          onAction={() => navigate('/purchase-requests/new')}
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isProcessing && setDeleteModalOpen(false)}
        title="Delete Purchase Request"
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isProcessing}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={isProcessing}>
              {isProcessing ? 'Deleting...' : 'Delete Request'}
            </Button>
          </>
        }
      >
        <p className="text-slate-700">Are you sure you want to delete <strong>{selectedPr?.requestNumber}</strong>?</p>
        <p className="mt-2 text-sm text-orange-600 font-medium">This action can be restored by an administrator.</p>
      </Modal>

      {/* Submit Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => !isProcessing && setSubmitModalOpen(false)}
        title="Submit Purchase Request"
        actions={
          <>
            <Button variant="ghost" onClick={() => setSubmitModalOpen(false)} disabled={isProcessing}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitConfirm} disabled={isProcessing}>
              {isProcessing ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to submit <strong>{selectedPr?.requestNumber}</strong> for approval? You will no longer be able to edit it.</p>
      </Modal>

      {/* Approve / Reject Dialogs */}
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
