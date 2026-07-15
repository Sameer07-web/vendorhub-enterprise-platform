import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Send, CheckCircle, XCircle, FileText } from 'lucide-react';
import { getRFQById, sendRFQ, closeRFQ, cancelRFQ } from '../../../api/rfq.api';
import RFQStatusBadge from '../components/RFQStatusBadge';
import VendorResponseProgress from '../components/VendorResponseProgress';
import RFQTimeline from '../components/RFQTimeline';
import { SendRFQDialog, CloseRFQDialog, CancelRFQDialog } from '../components/RFQDialogs';
import Loader from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import { formatDate } from '../../../utils/formatDate';
import { canEditRFQ, canSendRFQ, canCloseRFQ, canCancelRFQ } from '../../../utils/permissions';

const Card = ({ title, children, rightAction }) => (
  <div className="bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-surface-200 bg-surface-50 flex justify-between items-center">
      <h3 className="text-lg font-medium text-surface-800">{title}</h3>
      {rightAction && <div>{rightAction}</div>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const RFQDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rfq, setRfq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const fetchRFQ = async () => {
    try {
      setIsLoading(true);
      const response = await getRFQById(id);
      if (response.success) {
        setRfq(response.data);
      }
    } catch {
      setError('Failed to load RFQ details. Please ensure the backend is available.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQ();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSendConfirm = async () => {
    try {
      setIsProcessing(true);
      await sendRFQ(id);
      toast.success('RFQ sent successfully');
      setSendModalOpen(false);
      fetchRFQ();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send RFQ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseConfirm = async () => {
    try {
      setIsProcessing(true);
      await closeRFQ(id);
      toast.success('RFQ closed successfully');
      setCloseModalOpen(false);
      fetchRFQ();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close RFQ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      setIsProcessing(true);
      await cancelRFQ(id);
      toast.success('RFQ cancelled successfully');
      setCancelModalOpen(false);
      fetchRFQ();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel RFQ');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="max-w-5xl mx-auto mt-8"><Loader rows={8} /></div>;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8">
        <div className="bg-error-50 text-error-600 p-4 rounded-lg border border-error-200">
          <h3 className="font-semibold text-lg mb-1">Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/app/rfqs')} className="mt-4 text-sm font-medium hover:underline">
            &larr; Back to RFQs
          </button>
        </div>
      </div>
    );
  }

  if (!rfq) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/app/rfqs')}
            className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900">{rfq.rfqNumber}</h1>
              <RFQStatusBadge status={rfq.status} />
            </div>
            <p className="text-sm text-surface-500 mt-1">{rfq.title}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canEditRFQ(rfq) && (
            <Button variant="secondary" onClick={() => navigate(`/rfqs/${rfq._id}/edit`)}>
              <Edit size={16} className="mr-2" /> Edit Draft
            </Button>
          )}
          {canSendRFQ(rfq) && (
            <Button variant="primary" onClick={() => setSendModalOpen(true)}>
              <Send size={16} className="mr-2" /> Send RFQ
            </Button>
          )}
          {canCloseRFQ(rfq) && (
            <Button variant="primary" onClick={() => setCloseModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 border-emerald-600">
              <CheckCircle size={16} className="mr-2" /> Close RFQ
            </Button>
          )}
          {canCancelRFQ(rfq) && (
            <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
              <XCircle size={16} className="mr-2" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="General Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-surface-500">Title</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Quotation Deadline</dt>
                <dd className={`mt-1 text-sm font-medium ${new Date(rfq.quotationDeadline) < new Date() && !['CLOSED', 'CANCELLED'].includes(rfq.status) ? 'text-error-600' : 'text-surface-900'}`}>
                  {formatDate(rfq.quotationDeadline)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-surface-500">Description</dt>
                <dd className="mt-1 text-sm text-surface-900 whitespace-pre-wrap">{rfq.description || 'No description provided.'}</dd>
              </div>
            </dl>
          </Card>

          <Card 
            title="Purchase Request Snapshot" 
            rightAction={
              <Link to={`/purchase-requests/${rfq.purchaseRequest?._id || rfq.purchaseRequest}`} className="text-sm text-primary-600 hover:underline flex items-center">
                <FileText size={14} className="mr-1" /> View Original PR
              </Link>
            }
          >
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-surface-500">Request Number</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.purchaseRequestSnapshot?.requestNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Title</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.purchaseRequestSnapshot?.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Department</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.purchaseRequestSnapshot?.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Priority</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.purchaseRequestSnapshot?.priority}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Selected Vendors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Vendor Code</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Company Name</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                  {rfq.vendors?.map((vendor) => (
                    <tr key={vendor._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-surface-900">{vendor.vendorCode}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-surface-900">{vendor.companyName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <Link to={`/vendors/${vendor._id}`} className="text-primary-600 hover:text-primary-900 hover:underline">Profile</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Vendor Quotations">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-surface-300" />
              <h3 className="mt-2 text-sm font-medium text-surface-900">No quotations received yet.</h3>
              <p className="mt-1 text-sm text-surface-500">Vendor Quotation module will populate this section.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Response Progress">
            <VendorResponseProgress vendorResponses={rfq.vendorResponses} />
          </Card>
          
          <Card title="Timeline">
            <RFQTimeline rfq={rfq} />
          </Card>
          
          <Card title="Audit Information">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-surface-500 uppercase tracking-wider">Created By</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.createdBy?.fullName}</dd>
                <dd className="text-xs text-surface-500">{formatDate(rfq.createdAt, true)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-surface-500 uppercase tracking-wider">Last Updated By</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.updatedBy?.fullName || rfq.createdBy?.fullName}</dd>
                <dd className="text-xs text-surface-500">{formatDate(rfq.updatedAt, true)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <SendRFQDialog isOpen={sendModalOpen} onClose={() => setSendModalOpen(false)} onConfirm={handleSendConfirm} isSubmitting={isProcessing} />
      <CloseRFQDialog isOpen={closeModalOpen} onClose={() => setCloseModalOpen(false)} onConfirm={handleCloseConfirm} isSubmitting={isProcessing} />
      <CancelRFQDialog isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelConfirm} isSubmitting={isProcessing} />
    </div>
  );
};

export default RFQDetails;
