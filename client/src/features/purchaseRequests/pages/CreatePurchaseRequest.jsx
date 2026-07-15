import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import PurchaseRequestForm from '../components/PurchaseRequestForm';
import { createPurchaseRequest } from '../../../api/purchaseRequest.api';

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
      toast.error(error?.response?.data?.message || 'Failed to create Purchase Request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Create Purchase Request</h1>
          <p className="text-sm text-surface-500 mt-1">Draft a new request for procurement.</p>
        </div>
      </div>

      <PurchaseRequestForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        mode="create" 
      />
    </div>
  );
};

export default CreatePurchaseRequest;
