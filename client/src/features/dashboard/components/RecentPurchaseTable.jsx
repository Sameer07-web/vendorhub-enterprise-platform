import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { Card, CardHeader, CardBody } from '../../../components/common/Card';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';

const RecentPurchaseTable = ({ data = [] }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'PENDING_APPROVAL': return 'warning';
      case 'REJECTED': return 'error';
      case 'CANCELLED': return 'error';
      default: return 'secondary';
    }
  };

  const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const columns = [
    { 
      key: 'title', 
      label: 'Request', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-surface-900">{row.title}</span>
          <span className="text-xs text-surface-500">{row.id} • {row.department}</span>
        </div>
      ) 
    },
    { key: 'vendor', label: 'Created By' },
    { key: 'amount', label: 'Amount', align: 'right', render: (row) => <span className="font-medium text-surface-900">{typeof row.amount === 'number' ? formatCurrency(row.amount) : row.amount}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => (
        <Badge variant={getStatusBadge(row.status)}>
          {formatStatus(row.status)}
        </Badge>
      ) 
    },
    { key: 'date', label: 'Date', align: 'right', render: (row) => <span className="text-surface-500">{row.date ? formatDate(row.date) : ''}</span> },
    {
      key: 'actions',
      label: '',
      stickyRight: true,
      align: 'right',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={(e) => {
          e.stopPropagation();
          navigate(`/app/purchase-requests/${row._id}`);
        }}>
          View
        </Button>
      )
    }
  ];

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader 
        title="Recent Purchase Requests" 
        action={
          <Button variant="secondary" size="sm" endIcon={ArrowRight} onClick={() => navigate('/app/purchase-requests')}>
            View All
          </Button>
        }
      />
      <CardBody className="p-0">
        {data.length > 0 ? (
          <Table 
            columns={columns}
            data={data}
            onRowClick={(row) => navigate(`/app/purchase-requests/${row._id}`)}
          />
        ) : (
          <div className="p-8 text-center text-surface-500 text-sm">
            No purchase requests yet. Create your first one!
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentPurchaseTable;
