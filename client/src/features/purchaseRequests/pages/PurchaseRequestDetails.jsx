import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit, Send, CheckCircle, XCircle } from 'lucide-react';
import { getPurchaseRequestById, submitPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest } from '../../../api/purchaseRequest.api';
import PurchaseRequestStatusBadge from '../components/PurchaseRequestStatusBadge';
import ApprovalTimeline from '../components/ApprovalTimeline';
import ApprovalDialog from '../components/ApprovalDialog';
import RejectDialog from '../components/RejectDialog';
import Loader from '../../../components/common/Loader';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import DetailCard from '../../../components/common/DetailCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { 
  canEditPurchaseRequest, 
  canSubmitPurchaseRequest, 
  canApprovePurchaseRequest, 
  canRejectPurchaseRequest 
} from '../../../utils/permissions';

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

  const fetchPR = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchPR();
  }, [fetchPR]);

  const handleSubmitConfirm = async () => {
    try {
      setIsProcessing(true);
      await submitPurchaseRequest(id);
      toast.success('Request submitted successfully');
      setSubmitModalOpen(false);
      fetchPR();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit request');
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
      toast.error(err?.message || 'Failed to approve request');
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
      toast.error(err?.message || 'Failed to reject request');
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
        <div className="bg-error-50 text-error-600 p-4 rounded-lg border border-error-200">
          <h3 className="font-semibold text-lg mb-1">Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/app/purchase-requests')} className="mt-4 text-sm font-medium hover:underline">
            &larr; Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (!pr) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{pr.requestNumber}</span>
            <PurchaseRequestStatusBadge status={pr.status} />
          </div>
        }
        description={pr.title}
        backHref="/app/purchase-requests"
        action={
          <>
            {canEditPurchaseRequest(pr) && (
              <Button variant="secondary" onClick={() => navigate(`/app/purchase-requests/${pr._id}/edit`)}>
                <Edit size={16} className="mr-2" /> Edit Draft
              </Button>
            )}
            {canSubmitPurchaseRequest(pr) && (
              <Button variant="primary" onClick={() => setSubmitModalOpen(true)}>
                <Send size={16} className="mr-2" /> Submit
              </Button>
            )}
            {canApprovePurchaseRequest() && pr.status === 'Pending Approval' && (
              <Button variant="primary" onClick={() => setApproveModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
                <CheckCircle size={16} className="mr-2" /> Approve
              </Button>
            )}
            {canRejectPurchaseRequest() && pr.status === 'Pending Approval' && (
              <Button variant="danger" onClick={() => setRejectModalOpen(true)}>
                <XCircle size={16} className="mr-2" /> Reject
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailCard title="General Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-surface-500">Title</dt>
                <dd className="mt-1 text-sm text-surface-900">{pr.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Department</dt>
                <dd className="mt-1 text-sm text-surface-900">{pr.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Category</dt>
                <dd className="mt-1 text-sm text-surface-900">{pr.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Priority</dt>
                <dd className="mt-1 text-sm text-surface-900">{pr.priority}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-surface-500">Description</dt>
                <dd className="mt-1 text-sm text-surface-900 whitespace-pre-wrap">{pr.description}</dd>
              </div>
            </dl>
          </DetailCard>

          <DetailCard title="Financial Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-surface-500">Estimated Cost</dt>
                <dd className="mt-1 text-lg font-semibold text-surface-900">
                  {formatCurrency(pr.estimatedCost, pr.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Required Date</dt>
                <dd className="mt-1 text-sm text-surface-900">{formatDate(pr.requiredDate)}</dd>
              </div>
            </dl>
          </DetailCard>

          <DetailCard title="Vendor Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-surface-500">Selected Vendor</dt>
                <dd className="mt-1 text-sm text-surface-900 flex items-center">
                  <span className="font-medium mr-2">{pr.vendorName}</span>
                  <Link to={`/app/vendors/${pr.vendorId}`} className="ml-3 text-primary-600 hover:underline text-xs">
                    View Vendor &rarr;
                  </Link>
                </dd>
              </div>
            </dl>
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Approval Timeline">
            <ApprovalTimeline purchaseRequest={pr} />
          </DetailCard>
          
          <DetailCard title="Audit Information">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-surface-500 uppercase tracking-wider">Created By</dt>
                <dd className="mt-1 text-sm text-surface-900">{pr.requester}</dd>
                <dd className="text-xs text-surface-500">{formatDate(pr.createdAt, true)}</dd>
              </div>
            </dl>
          </DetailCard>
        </div>
      </div>

      <Modal
        isOpen={submitModalOpen}
        onClose={() => !isProcessing && setSubmitModalOpen(false)}
        title="Submit Purchase Request"
        actions={
          <>
            <Button variant="ghost" onClick={() => setSubmitModalOpen(false)} disabled={isProcessing}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitConfirm} isLoading={isProcessing}>
              Submit for Approval
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
        title={`Approve ${pr.requestNumber}`}
      />
      <RejectDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isSubmitting={isProcessing}
        title={`Reject ${pr.requestNumber}`}
      />
    </div>
  );
};

export default PurchaseRequestDetails;
