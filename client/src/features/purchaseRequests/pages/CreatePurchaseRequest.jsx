import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PurchaseRequestForm from '../components/PurchaseRequestForm';
import { createPurchaseRequest } from '../../../api/purchaseRequest.api';
import PageHeader from '../../../components/common/PageHeader';

const CreatePurchaseRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await createPurchaseRequest(formData);
      toast.success('Purchase Request created successfully');
      navigate('/app/purchase-requests');
    } catch (error) {
      toast.error(error?.message || 'Failed to create Purchase Request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Create Purchase Request"
        description="Draft a new request for procurement."
        backHref="/app/purchase-requests"
      />

      <PurchaseRequestForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        mode="create" 
      />
    </div>
  );
};

export default CreatePurchaseRequest;
