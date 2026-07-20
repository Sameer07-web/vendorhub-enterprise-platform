import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ClipboardCheck, RefreshCw } from 'lucide-react';
import { getQuotations } from '../../../api/quote.api';
import PageHeader from '../../../components/common/PageHeader';
import SearchBar from '../../../components/common/SearchBar';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { Card, CardBody } from '../../../components/common/Card';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';

const QuotationList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const page = parseInt(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await getQuotations(params);
      if (res.success) {
        setQuotations(res.data?.quotations || []);
        setTotalPages(res.data?.totalPages || 1);
        setTotal(res.data?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load quotations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleSearch = (value) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (value) p.set('search', value);
      else p.delete('search');
      p.set('page', '1');
      return p;
    });
  };

  const handleStatusFilter = (s) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (s) p.set('status', s);
      else p.delete('status');
      p.set('page', '1');
      return p;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('page', String(newPage));
      return p;
    });
  };

  const getStatusBadge = (q) => {
    if (q.isWinner) return 'success';
    if (q.status === 'REJECTED') return 'error';
    if (q.status === 'REVIEWED') return 'warning';
    return 'secondary';
  };

  const getStatusLabel = (q) => {
    if (q.isWinner) return 'Winner';
    if (q.status === 'REJECTED') return 'Rejected';
    if (q.status === 'REVIEWED') return 'Reviewed';
    return q.status || 'Submitted';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Quotations"
        subtitle={`${total} total quotations`}
        icon={ClipboardCheck}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          placeholder="Search quotations..."
          value={search}
          onChange={handleSearch}
        />
        <div className="flex gap-2 flex-wrap">
          {['', 'SUBMITTED', 'REVIEWED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                status === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={fetchQuotations} title="Refresh">
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader />
      ) : quotations.length === 0 ? (
        <EmptyState
          title="No quotations found"
          description={search ? `No quotations match "${search}".` : 'Quotations will appear here once vendors submit them through RFQs.'}
          icon={ClipboardCheck}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-50">
                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Quotation #</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Vendor</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600">RFQ</th>
                    <th className="text-right px-4 py-3 font-semibold text-surface-600">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Delivery</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-surface-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotations.map((q) => (
                    <tr
                      key={q._id}
                      className="hover:bg-surface-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/rfqs/${q.rfq?._id || q.rfq}/quotes`)}
                    >
                      <td className="px-4 py-3.5 font-medium text-surface-900">{q.quotationNumber}</td>
                      <td className="px-4 py-3.5 text-surface-700">{q.vendorSnapshot?.companyName || '—'}</td>
                      <td className="px-4 py-3.5 text-surface-500">{q.rfq?.rfqNumber || q.rfq?.rfqId || '—'}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-surface-900">{formatCurrency(q.totalAmount)}</td>
                      <td className="px-4 py-3.5 text-surface-600">{q.deliveryDays ? `${q.deliveryDays} days` : '—'}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={getStatusBadge(q)} size="sm">
                          {getStatusLabel(q)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right text-surface-500">{formatDate(q.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default QuotationList;
