import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PurchaseRequestForm from '../components/PurchaseRequestForm';
import { getPurchaseRequestById, updatePurchaseRequest } from '../../../api/purchaseRequest.api';
import Loader from '../../../components/common/Loader';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';
import { canEditPurchaseRequest } from '../../../utils/permissions';

const EditPurchaseRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPR = async () => {
      try {
        setIsLoading(true);
        const response = await getPurchaseRequestById(id);
        if (response.success) {
          const pr = response.data;
          if (!canEditPurchaseRequest(pr)) {
            toast.error('You do not have permission to edit this request');
            navigate(`/app/purchase-requests/${id}`);
            return;
          }
          setInitialData(pr);
        }
      } catch {
        setError('Failed to load purchase request details. Please ensure the backend is available.');
        toast.error('Failed to load purchase request');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPR();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await updatePurchaseRequest(id, formData);
      toast.success('Purchase Request updated successfully');
      navigate(`/app/purchase-requests/${id}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to update Purchase Request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto mt-8"><Loader rows={12} /></div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <EmptyState 
          title="Purchase Request Not Found" 
          message={error}
          actionLabel="Back to Requests"
          onAction={() => navigate('/app/purchase-requests')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Edit Purchase Request"
        description={`Update draft information for ${initialData?.requestNumber}.`}
        backHref="/app/purchase-requests"
      />

      {initialData && (
        <PurchaseRequestForm 
          initialData={initialData}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          mode="edit" 
        />
      )}
    </div>
  );
};

export default EditPurchaseRequest;
