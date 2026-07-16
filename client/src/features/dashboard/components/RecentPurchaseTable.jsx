import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { Card, CardHeader, CardBody } from '../../../components/common/Card';

const RecentPurchaseTable = ({ data = [] }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'secondary';
    }
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
    { key: 'vendor', label: 'Vendor' },
    { key: 'amount', label: 'Amount', align: 'right', render: (row) => <span className="font-medium text-surface-900">{row.amount}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => (
        <Badge variant={getStatusBadge(row.status)}>
          {row.status}
        </Badge>
      ) 
    },
    { key: 'date', label: 'Date', align: 'right', render: (row) => <span className="text-surface-500">{row.date}</span> },
    {
      key: 'actions',
      label: '',
      stickyRight: true,
      align: 'right',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={(e) => {
          e.stopPropagation();
          navigate(`/app/purchase-requests/${row.id}`);
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
        <Table 
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/app/purchase-requests/${row.id}`)}
        />
      </CardBody>
    </Card>
  );
};

export default RecentPurchaseTable;
