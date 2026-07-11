import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Send, CheckCircle, XCircle } from 'lucide-react';
import { getPurchaseRequestById, submitPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest } from '../../../api/purchaseRequest.api';
import PurchaseRequestStatusBadge from '../components/PurchaseRequestStatusBadge';
import ApprovalTimeline from '../components/ApprovalTimeline';
import ApprovalDialog from '../components/ApprovalDialog';
import RejectDialog from '../components/RejectDialog';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { 
  canEditPurchaseRequest, 
  canSubmitPurchaseRequest, 
  canApprovePurchaseRequest, 
  canRejectPurchaseRequest 
} from '../../../utils/permissions';

const Card = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
      <h3 className="text-lg font-medium text-slate-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const PurchaseRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pr, setPr] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const fetchPR = async () => {
    try {
      setIsLoading(true);
      const response = await getPurchaseRequestById(id);
      if (response.success) {
        setPr(response.data);
      }
    } catch {
      setError('Failed to load purchase request details. Please ensure the backend is available.');
      toast.error('Failed to load purchase request');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitConfirm = async () => {
    try {
      setIsProcessing(true);
      await submitPurchaseRequest(id);
      toast.success('Request submitted successfully');
      setSubmitModalOpen(false);
      fetchPR();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveConfirm = async (comments) => {
    try {
      setIsProcessing(true);
      await approvePurchaseRequest(id, comments);
      toast.success('Request approved successfully');
      setApproveModalOpen(false);
      fetchPR();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (comments) => {
    try {
      setIsProcessing(true);
      await rejectPurchaseRequest(id, comments);
      toast.success('Request rejected successfully');
      setRejectModalOpen(false);
      fetchPR();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto mt-8"><Loader rows={8} /></div>;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-lg mb-1">Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/purchase-requests')} className="mt-4 text-sm font-medium hover:underline">
            &larr; Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (!pr) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/purchase-requests')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{pr.requestNumber}</h1>
              <PurchaseRequestStatusBadge status={pr.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">{pr.title}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {canEditPurchaseRequest(pr) && (
            <Button variant="secondary" onClick={() => navigate(`/purchase-requests/${pr._id}/edit`)}>
              <Edit size={16} className="mr-2" /> Edit Draft
            </Button>
          )}
          {canSubmitPurchaseRequest(pr) && (
            <Button variant="primary" onClick={() => setSubmitModalOpen(true)}>
              <Send size={16} className="mr-2" /> Submit
            </Button>
          )}
          {canApprovePurchaseRequest() && pr.status === 'PENDING_APPROVAL' && (
            <Button variant="primary" onClick={() => setApproveModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
              <CheckCircle size={16} className="mr-2" /> Approve
            </Button>
          )}
          {canRejectPurchaseRequest() && pr.status === 'PENDING_APPROVAL' && (
            <Button variant="danger" onClick={() => setRejectModalOpen(true)}>
              <XCircle size={16} className="mr-2" /> Reject
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="General Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-slate-500">Title</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Department</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Category</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Priority</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.priority}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{pr.description}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Financial Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-slate-500">Estimated Cost</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">
                  {formatCurrency(pr.estimatedCost, pr.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Quantity</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.quantity}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Required Date</dt>
                <dd className="mt-1 text-sm text-slate-900">{formatDate(pr.requiredDate)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Vendor Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Selected Vendor</dt>
                <dd className="mt-1 text-sm text-slate-900 flex items-center">
                  <span className="font-medium mr-2">{pr.vendor?.companyName}</span>
                  <span className="text-slate-500">({pr.vendor?.vendorCode})</span>
                  <Link to={`/vendors/${pr.vendor?._id}`} className="ml-3 text-blue-600 hover:underline text-xs">
                    View Vendor &rarr;
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">GST Number</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.vendor?.gstNumber || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Vendor Status</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.vendor?.status || 'Unknown'}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Approval Timeline">
            <ApprovalTimeline purchaseRequest={pr} />
          </Card>
          
          <Card title="Audit Information">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Created By</dt>
                <dd className="mt-1 text-sm text-slate-900">{pr.createdBy?.fullName}</dd>
                <dd className="text-xs text-slate-500">{formatDate(pr.createdAt, true)}</dd>
              </div>
              {pr.managerComments && (
                <div className="pt-4 border-t border-slate-100">
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Manager Comments</dt>
                  <dd className="mt-1 text-sm text-slate-900 italic bg-slate-50 p-3 rounded-md border border-slate-100">
                    "{pr.managerComments}"
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>

      {/* Modals */}
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
        <p>Are you sure you want to submit this request? You will no longer be able to edit it.</p>
      </Modal>

      <ApprovalDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        isSubmitting={isProcessing}
      />
      <RejectDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isSubmitting={isProcessing}
      />
    </div>
  );
};

export default PurchaseRequestDetails;
