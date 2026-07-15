import Badge from '../../../components/common/Badge';

const PurchaseRequestStatusBadge = ({ status }) => {
  const getVariant = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'DRAFT':
        return 'secondary';
      case 'PENDING_APPROVAL':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      case 'COMPLETED':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {status?.replace('_', ' ') || 'UNKNOWN'}
    </Badge>
  );
};

export default PurchaseRequestStatusBadge;
