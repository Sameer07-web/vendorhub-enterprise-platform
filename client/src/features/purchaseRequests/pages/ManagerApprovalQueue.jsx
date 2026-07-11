import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPurchaseRequests, approvePurchaseRequest, rejectPurchaseRequest } from '../../../api/purchaseRequest.api';
import PurchaseRequestTable from '../components/PurchaseRequestTable';
import ApprovalDialog from '../components/ApprovalDialog';
import RejectDialog from '../components/RejectDialog';
import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import { ClipboardCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex items-center">
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 mr-4`}>
      <Icon size={24} className={colorClass} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

const ManagerApprovalQueue = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPending, setTotalPending] = useState(0);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPr, setSelectedPr] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateUrlParams = useCallback((newParams) => {
    const current = Object.fromEntries(searchParams);
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach(key => { if (!updated[key]) delete updated[key]; });
    setSearchParams(updated, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchPendingPRs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPurchaseRequests({
        page,
        limit: 10,
        search,
        status: 'PENDING_APPROVAL',
        sort: 'requiredDate' // prioritize what's needed soonest
      });
      if (response.success) {
        setRequests(response.data.purchaseRequests);
        setTotalPages(response.data.totalPages);
        setTotalPending(response.data.total);
      }
    } catch {
      setError('Failed to load pending approvals. Please ensure the backend is available.');
      toast.error('Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPendingPRs();
  }, [fetchPendingPRs]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    updateUrlParams({ search: val, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const handleApproveConfirm = async (comments) => {
    try {
      setIsProcessing(true);
      await approvePurchaseRequest(selectedPr._id, comments);
      toast.success('Request approved successfully');
      setApproveModalOpen(false);
      fetchPendingPRs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve request');
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
      fetchPendingPRs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Review and action pending purchase requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Pending" value={totalPending} icon={Clock} colorClass="text-blue-600" />
        <SummaryCard title="Requires Action" value={totalPending} icon={ClipboardCheck} colorClass="text-orange-500" />
        <SummaryCard title="Approved Today" value="--" icon={CheckCircle} colorClass="text-emerald-500" />
        <SummaryCard title="Rejected Today" value="--" icon={XCircle} colorClass="text-red-500" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="max-w-md">
          <SearchBar 
            placeholder="Search by request number, title..." 
            onSearch={handleSearch} 
            initialValue={search}
          />
        </div>
      </div>

      {loading ? (
        <Loader rows={8} />
      ) : error ? (
        <EmptyState title="System Error" message={error} actionLabel="Try Again" onAction={fetchPendingPRs} />
      ) : requests.length > 0 ? (
        <div className="flex flex-col">
          <PurchaseRequestTable 
            purchaseRequests={requests} 
            onApproveClick={(pr) => { setSelectedPr(pr); setApproveModalOpen(true); }}
            onRejectClick={(pr) => { setSelectedPr(pr); setRejectModalOpen(true); }}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      ) : (
        <EmptyState 
          title="No pending approvals" 
          message="You're all caught up! There are no purchase requests waiting for your approval right now."
        />
      )}

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

export default ManagerApprovalQueue;
