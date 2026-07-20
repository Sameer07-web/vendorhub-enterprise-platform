import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit, Send, CheckCircle, XCircle, FileText } from 'lucide-react';
import { getRFQById, sendRFQ, closeRFQ, cancelRFQ } from '../../../api/rfq.api';
import { getQuotesByRFQ, createQuotation } from '../../../api/quote.api';
import { getVendors } from '../../../api/vendor.api';
import RFQStatusBadge from '../components/RFQStatusBadge';
import RFQTimeline from '../components/RFQTimeline';
import Loader from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import DetailCard from '../../../components/common/DetailCard';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import { canEditRFQ, canSendRFQ, canCloseRFQ, canCancelRFQ } from '../../../utils/permissions';

const RFQDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rfq, setRfq] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [vendors, setVendors] = useState([]); // Loaded to get vendor names
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rfqRes, quotesRes, vendorsRes] = await Promise.all([
        getRFQById(id),
        getQuotesByRFQ(id),
        getVendors({ limit: 100 })
      ]);
      
      if (rfqRes.success) {
        setRfq(rfqRes.data);
      }
      if (quotesRes.success) {
        setQuotes(quotesRes.data);
      }
      if (vendorsRes.success) {
        setVendors(vendorsRes.data.vendors);
      }
    } catch {
      setError('Failed to load RFQ details. Please ensure the backend is available.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSendConfirm = async () => {
    try {
      setIsProcessing(true);
      await sendRFQ(id);
      toast.success('RFQ sent successfully');
      setSendModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err?.message || 'Failed to send RFQ');
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
      fetchDetails();
    } catch (err) {
      toast.error(err?.message || 'Failed to close RFQ');
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
      fetchDetails();
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel RFQ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateResponses = async () => {
    try {
      setIsProcessing(true);
      const vendorsToInvite = rfq.vendors || [];
      if (vendorsToInvite.length === 0) {
        toast.error('No vendors invited to this RFQ');
        return;
      }

      await Promise.all(
        vendorsToInvite.map(v => {
          const vendorId = typeof v === 'object' ? v._id : v;
          const subtotal = Math.round(20000 + Math.random() * 30000);
          return createQuotation({
            rfq: rfq._id,
            vendor: vendorId,
            subtotal,
            taxAmount: Math.round(subtotal * 0.1),
            shippingCost: 500,
            discount: 1000,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        })
      );

      toast.success('Vendor responses simulated successfully via API');
      fetchDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to simulate responses');
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
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{rfq.rfqNumber}</span>
            <RFQStatusBadge status={rfq.status} />
          </div>
        }
        description={rfq.title}
        backHref="/app/rfqs"
        action={
          <>
            {canEditRFQ(rfq) && (
              <Button variant="secondary" onClick={() => navigate(`/app/rfqs/${rfq._id}/edit`)}>
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

            {['SENT', 'PARTIALLY_RESPONDED'].includes(rfq.status) && (
              <Button variant="secondary" onClick={handleSimulateResponses} isLoading={isProcessing}>
                Simulate Responses
              </Button>
            )}
            {quotes.length > 0 && ['Published', 'SENT', 'PARTIALLY_RESPONDED', 'CLOSED'].includes(rfq.status) && (
              <Button variant="primary" onClick={() => navigate(`/app/rfqs/${rfq._id}/compare`)}>
                Compare Quotes
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
                <dd className="mt-1 text-sm text-surface-900">{rfq.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Department</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.department || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-surface-500">Quotation Deadline</dt>
                <dd className={`mt-1 text-sm font-medium ${rfq.dueDate && new Date(rfq.dueDate) < new Date() && !['Closed', 'Awarded', 'Cancelled'].includes(rfq.status) ? 'text-error-600' : 'text-surface-900'}`}>
                  {rfq.dueDate ? formatDate(rfq.dueDate) : 'N/A'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-surface-500">Description</dt>
                <dd className="mt-1 text-sm text-surface-900 whitespace-pre-wrap">{rfq.description || 'No description provided.'}</dd>
              </div>
            </dl>
          </DetailCard>

          <DetailCard title="Line Items">
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Item</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Description</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Qty</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                  {(rfq.lineItems || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-surface-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-surface-500">{item.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-surface-900">{item.quantity}</td>
                    </tr>
                  ))}
                  {(!rfq.lineItems || rfq.lineItems.length === 0) && (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-sm text-surface-500">No line items specified.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DetailCard>

          <DetailCard title="Invited Vendors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Company Name</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                  {(rfq.vendors || []).map((v) => {
                    const vendor = typeof v === 'object' ? v : (vendors.find(item => item._id === v) || { companyName: 'Unknown Vendor' });
                    const vendorId = typeof v === 'object' ? v._id : v;
                    return (
                      <tr key={vendorId}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-surface-900">{vendor.companyName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <Link to={`/app/vendors/${vendorId}`} className="text-primary-600 hover:text-primary-900 hover:underline">Profile</Link>
                        </td>
                      </tr>
                    );
                  })}
                  {(!rfq.vendors || rfq.vendors.length === 0) && (
                    <tr>
                      <td colSpan="2" className="px-4 py-8 text-center text-sm text-surface-500">No vendors invited.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DetailCard>

          <DetailCard title="Vendor Quotations">
            <div className="overflow-x-auto">
              {quotes.length > 0 ? (
                <table className="min-w-full divide-y divide-surface-200">
                  <thead className="bg-surface-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase">Vendor</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Total Price</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-surface-200">
                    {quotes.map((quote) => (
                      <tr key={quote._id} className={quote.isWinner ? 'bg-emerald-50' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-surface-900">
                          {quote.vendorName}
                          {quote.isWinner && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Awarded</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-surface-900">{formatCurrency(quote.totalPrice, quote.currency)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-surface-500">{quote.deliveryTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-surface-300" />
                  <h3 className="mt-2 text-sm font-medium text-surface-900">No quotations received yet.</h3>
                  <p className="mt-1 text-sm text-surface-500">Vendors have not submitted any quotes.</p>
                </div>
              )}
            </div>
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Timeline">
            <RFQTimeline rfq={rfq} />
          </DetailCard>
          
          <DetailCard title="Audit Information">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-surface-500 uppercase tracking-wider">Created By</dt>
                <dd className="mt-1 text-sm text-surface-900">{rfq.createdBy || 'Unknown'}</dd>
                <dd className="text-xs text-surface-500">{formatDate(rfq.createdAt, true)}</dd>
              </div>
            </dl>
          </DetailCard>
        </div>
      </div>

      <ConfirmDialog
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onConfirm={handleSendConfirm}
        title={`Send ${rfq.rfqNumber}`}
        message="Are you sure you want to send this RFQ to all selected vendors? This action will formally start the quotation process and cannot be reversed."
        confirmText="Send RFQ"
        variant="primary"
        isLoading={isProcessing}
      />
      <ConfirmDialog
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={handleCloseConfirm}
        title={`Close ${rfq.rfqNumber}`}
        message="Are you sure you want to close this RFQ? Vendors will no longer be able to submit quotations. This action cannot be reversed."
        confirmText="Close RFQ"
        variant="primary"
        isLoading={isProcessing}
      />
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title={`Cancel ${rfq.rfqNumber}`}
        message="Are you sure you want to cancel this RFQ? This will mark it as cancelled and it can no longer be edited or sent. This action cannot be reversed."
        confirmText="Cancel RFQ"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};

export default RFQDetails;
