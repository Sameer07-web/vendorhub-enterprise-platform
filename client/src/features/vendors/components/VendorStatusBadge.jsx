import React from 'react';
import Badge from '../../../components/common/Badge';

const VendorStatusBadge = ({ status }) => {
  const statusConfig = {
    Active: 'success',
    Inactive: 'default',
    Pending: 'primary',
    Suspended: 'danger',
  };

  const variant = statusConfig[status] || 'default';

  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  );
};

export default VendorStatusBadge;
