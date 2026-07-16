import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trophy, CheckCircle } from 'lucide-react';
import { getRFQById, awardRFQ } from '../../../api/rfq.api';
import { getQuotesByRFQ } from '../../../api/quote.api';
import PageHeader from '../../../components/common/PageHeader';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { formatCurrency } from '../../../utils/formatCurrency';

const QuoteComparison = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rfq, setRfq] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [justification, setJustification] = useState('');
  const [isAwarding, setIsAwarding] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rfqRes, quotesRes] = await Promise.all([
        getRFQById(id),
        getQuotesByRFQ(id)
      ]);
      
      if (rfqRes.success) {
        setRfq(rfqRes.data);
      }
      if (quotesRes.success) {
        // Sort quotes by total price ascending
        setQuotes(quotesRes.data.sort((a, b) => a.totalPrice - b.totalPrice));
      }
    } catch {
      setError('Failed to load comparison data. Please ensure the backend is available.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleAwardClick = (quote) => {
    setSelectedQuote(quote);
    setJustification('');
    setAwardModalOpen(true);
  };

  const handleAwardConfirm = async () => {
    try {
      setIsAwarding(true);
      await awardRFQ(id, selectedQuote.vendorId, selectedQuote._id, justification || 'Best overall value based on comparison.');
      toast.success(`RFQ awarded to ${selectedQuote.vendorName}`);
      setAwardModalOpen(false);
      navigate(`/app/rfqs/${id}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to award RFQ');
    } finally {
      setIsAwarding(false);
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto mt-8"><Loader rows={8} /></div>;

  if (error || !rfq) {
    return (
      <div className="max-w-7xl mx-auto mt-8">
        <EmptyState title="Error Loading Quotes" message={error} actionLabel="Go Back" onAction={() => navigate(`/app/rfqs/${id}`)} />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto mt-8">
        <EmptyState title="No Quotes Available" message="There are no quotes to compare for this RFQ." actionLabel="Go Back" onAction={() => navigate(`/app/rfqs/${id}`)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Quote Comparison"
        description={`Comparing quotes for ${rfq.rfqNumber} — ${rfq.title}`}
        backHref={`/app/rfqs/${id}`}
      />

      <div className="bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-200 table-fixed">
          <thead className="bg-surface-50">
            <tr>
              <th scope="col" className="w-1/4 px-6 py-4 text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-r border-surface-200">
                Criteria
              </th>
              {quotes.map((quote, idx) => (
                <th key={quote._id} scope="col" className={`w-1/4 px-6 py-4 text-left border-r border-surface-200 relative ${idx === 0 ? 'bg-primary-50/50' : ''}`}>
                  {idx === 0 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                      <Trophy size={10} className="mr-1" /> Lowest Price
                    </div>
                  )}
                  <div className="text-sm font-bold text-surface-900">{quote.vendorName}</div>
                  <div className="text-xs text-surface-500 mt-1">{quote.quoteNumber}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-surface-200">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-surface-900 border-r border-surface-200 bg-surface-50/50">Total Price</td>
              {quotes.map((quote, idx) => (
                <td key={quote._id} className={`px-6 py-4 text-lg font-bold border-r border-surface-200 ${idx === 0 ? 'text-primary-700 bg-primary-50/30' : 'text-surface-900'}`}>
                  {formatCurrency(quote.totalPrice, quote.currency)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-surface-900 border-r border-surface-200 bg-surface-50/50">Delivery Time</td>
              {quotes.map((quote) => (
                <td key={quote._id} className="px-6 py-4 text-sm text-surface-900 border-r border-surface-200">
                  {quote.deliveryTime}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-surface-900 border-r border-surface-200 bg-surface-50/50">Payment Terms</td>
              {quotes.map((quote) => (
                <td key={quote._id} className="px-6 py-4 text-sm text-surface-900 border-r border-surface-200">
                  {quote.paymentTerms}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-surface-900 border-r border-surface-200 bg-surface-50/50">Valid Until</td>
              {quotes.map((quote) => (
                <td key={quote._id} className="px-6 py-4 text-sm text-surface-900 border-r border-surface-200">
                  {new Date(quote.validUntil).toLocaleDateString()}
                </td>
              ))}
            </tr>
            
            {/* Line Items Expansion */}
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-surface-900 border-r border-surface-200 bg-surface-50/50" colSpan={quotes.length + 1}>
                Line Items Breakdown
              </td>
            </tr>
            {quotes[0]?.items.map((item, itemIdx) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm font-medium text-surface-700 border-r border-surface-200 bg-surface-50/20">
                  Item {itemIdx + 1}
                </td>
                {quotes.map((quote) => {
                  const quoteItem = quote.items[itemIdx];
                  return (
                    <td key={quote._id} className="px-6 py-4 text-sm text-surface-900 border-r border-surface-200">
                      <div>{formatCurrency(quoteItem?.total || 0, quote.currency)}</div>
                      <div className="text-xs text-surface-500 mt-1">{quoteItem?.notes}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {/* Award Action */}
            <tr>
              <td className="px-6 py-4 border-r border-surface-200 bg-surface-50/50"></td>
              {quotes.map((quote) => (
                <td key={quote._id} className="px-6 py-4 border-r border-surface-200 text-center">
                  {rfq.awardedQuoteId === quote._id ? (
                     <div className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-emerald-700 bg-emerald-100 w-full">
                       <CheckCircle size={16} className="mr-2" /> Awarded
                     </div>
                  ) : rfq.status === 'Awarded' ? (
                     <div className="text-sm text-surface-400">Not selected</div>
                  ) : (
                    <Button variant="primary" className="w-full justify-center" onClick={() => handleAwardClick(quote)}>
                      Award to {quote.vendorName}
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={awardModalOpen}
        onClose={() => !isAwarding && setAwardModalOpen(false)}
        onConfirm={handleAwardConfirm}
        title={`Award RFQ to ${selectedQuote?.vendorName}`}
        confirmText="Confirm Award"
        variant="primary"
        isLoading={isAwarding}
        message="" // overriding default message to inject custom children below
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-600">
            You are about to award this RFQ to <strong>{selectedQuote?.vendorName}</strong> for a total of <strong>{selectedQuote && formatCurrency(selectedQuote.totalPrice, selectedQuote.currency)}</strong>.
            This action will close the RFQ and notify the vendor.
          </p>
          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-surface-700 mb-1">
              Justification (Optional)
            </label>
            <textarea
              id="justification"
              rows={3}
              className="w-full rounded-md border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="e.g. Best overall value and fastest delivery time."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              disabled={isAwarding}
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
};

export default QuoteComparison;
