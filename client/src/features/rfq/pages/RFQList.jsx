import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { getRFQs, sendRFQ, closeRFQ, cancelRFQ } from '../../../api/rfq.api';
import RFQTable from '../components/RFQTable';
import { SendRFQDialog, CloseRFQDialog, CancelRFQDialog } from '../components/RFQDialogs';
import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import { canCreateRFQ } from '../../../utils/permissions';

const RFQList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog States
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateUrlParams = useCallback((newParams) => {
    const current = Object.fromEntries(searchParams);
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach(key => { if (!updated[key]) delete updated[key]; });
    setSearchParams(updated, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchRFQList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRFQs({
        page,
        limit: 10,
        search,
        status,
        sort: 'Newest'
      });
      if (response.success) {
        setRfqs(response.data.rfqs);
        setTotalPages(response.data.totalPages);
      }
    } catch {
      setError('Failed to load RFQs. Please ensure the backend is available.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchRFQList();
  }, [fetchRFQList]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    updateUrlParams({ search: val, page: 1 });
  };

  const handleFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setPage(1);
    updateUrlParams({ status: newStatus, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
  };

  // Action Handlers
  const handleSendConfirm = async () => {
    try {
      setIsProcessing(true);
      await sendRFQ(selectedRfq._id);
      toast.success('RFQ Sent successfully');
      setSendModalOpen(false);
      fetchRFQList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send RFQ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseConfirm = async () => {
    try {
      setIsProcessing(true);
      await closeRFQ(selectedRfq._id);
      toast.success('RFQ Closed successfully');
      setCloseModalOpen(false);
      fetchRFQList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close RFQ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      setIsProcessing(true);
      await cancelRFQ(selectedRfq._id);
      toast.success('RFQ Cancelled successfully');
      setCancelModalOpen(false);
      fetchRFQList();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel RFQ');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Request For Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vendor quotation requests and responses.</p>
        </div>
        {canCreateRFQ() && (
          <Button variant="primary" onClick={() => navigate('/rfqs/new')}>
            <Plus size={16} className="mr-2" />
            Create RFQ
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar 
            placeholder="Search by RFQ number, title, or PR..." 
            onSearch={handleSearch} 
            initialValue={search}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={handleFilterChange}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PARTIALLY_RESPONDED">Partially Responded</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader rows={8} />
      ) : error ? (
        <EmptyState title="System Error" message={error} actionLabel="Try Again" onAction={fetchRFQList} />
      ) : rfqs.length > 0 ? (
        <div className="flex flex-col">
          <RFQTable 
            rfqs={rfqs} 
            onSendClick={(rfq) => { setSelectedRfq(rfq); setSendModalOpen(true); }}
            onCloseClick={(rfq) => { setSelectedRfq(rfq); setCloseModalOpen(true); }}
            onCancelClick={(rfq) => { setSelectedRfq(rfq); setCancelModalOpen(true); }}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      ) : (
        <EmptyState 
          title="No RFQs Found" 
          message={search || status ? "No RFQs match your current filters." : "There are no Request For Quotations in the system."}
          actionLabel={search || status ? "Clear Filters" : (canCreateRFQ() ? "Create First RFQ" : null)}
          onAction={() => {
            if (search || status) {
              setSearch('');
              setStatus('');
              updateUrlParams({ search: '', status: '', page: 1 });
            } else if (canCreateRFQ()) {
              navigate('/rfqs/new');
            }
          }}
        />
      )}

      {/* Dialogs */}
      <SendRFQDialog isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} onConfirm={handleSendConfirm} isSubmitting={isProcessing} title={`Send ${selectedRfq?.rfqNumber}`} />
      <CloseRFQDialog isOpen={closeModalOpen} onClose={() => setCloseModalOpen(false)} onConfirm={handleCloseConfirm} isSubmitting={isProcessing} title={`Close ${selectedRfq?.rfqNumber}`} />
      <CancelRFQDialog isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelConfirm} isSubmitting={isProcessing} title={`Cancel ${selectedRfq?.rfqNumber}`} />
    </div>
  );
};

export default RFQList;
