import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, FileText } from 'lucide-react';
import { getRFQs, sendRFQ, closeRFQ, cancelRFQ } from '../../../api/rfq.api';
import RFQTable from '../components/RFQTable';
import { SendRFQDialog, CloseRFQDialog, CancelRFQDialog } from '../components/RFQDialogs';
import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
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

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SENT', label: 'Sent' },
    { value: 'PARTIALLY_RESPONDED', label: 'Partially Responded' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Request For Quotations</h1>
          <p className="text-sm text-surface-500 mt-1">Manage vendor quotation requests and responses.</p>
        </div>
        {canCreateRFQ() && (
          <Button variant="primary" onClick={() => navigate('/rfqs/new')} className="shadow-sm" startIcon={Plus}>
            Create RFQ
          </Button>
        )}
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm border border-border flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar 
            placeholder="Search by RFQ number, title, or PR..." 
            onSearch={handleSearch} 
            initialValue={search}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={statusOptions}
            value={status}
            onChange={handleFilterChange}
            className="w-full"
            label=""
          />
        </div>
      </div>

      {error ? (
        <EmptyState title="System Error" message={error} actionLabel="Try Again" onAction={fetchRFQList} />
      ) : (
        <div className="flex flex-col gap-4">
          <RFQTable 
            rfqs={rfqs} 
            isLoading={loading}
            onSendClick={(rfq) => { setSelectedRfq(rfq); setSendModalOpen(true); }}
            onCloseClick={(rfq) => { setSelectedRfq(rfq); setCloseModalOpen(true); }}
            onCancelClick={(rfq) => { setSelectedRfq(rfq); setCancelModalOpen(true); }}
          />
          {!loading && rfqs.length > 0 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
          {!loading && rfqs.length === 0 && (
            <EmptyState 
              title="No RFQs Found" 
              message={search || status ? "No RFQs match your current filters." : "There are no Request For Quotations in the system."}
              icon={FileText}
              actionLabel={search || status ? "Clear Filters" : (canCreateRFQ() ? "Create First RFQ" : undefined)}
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
        </div>
      )}

      {/* Dialogs */}
      <SendRFQDialog isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} onConfirm={handleSendConfirm} isSubmitting={isProcessing} title={`Send ${selectedRfq?.rfqNumber}`} />
      <CloseRFQDialog isOpen={closeModalOpen} onClose={() => setCloseModalOpen(false)} onConfirm={handleCloseConfirm} isSubmitting={isProcessing} title={`Close ${selectedRfq?.rfqNumber}`} />
      <CancelRFQDialog isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelConfirm} isSubmitting={isProcessing} title={`Cancel ${selectedRfq?.rfqNumber}`} />
    </div>
  );
};

export default RFQList;
