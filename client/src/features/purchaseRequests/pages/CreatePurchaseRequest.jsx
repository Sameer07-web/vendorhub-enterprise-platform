import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PurchaseRequestForm from '../components/PurchaseRequestForm';
import { createPurchaseRequest } from '../../../api/purchaseRequest.api';
import { getAIDraft } from '../../../api/ai.api';
import PageHeader from '../../../components/common/PageHeader';
import Loader from '../../../components/common/Loader';

const CreatePurchaseRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(!!draftId);

  useEffect(() => {
    if (draftId) {
      const loadDraft = async () => {
        try {
          const res = await getAIDraft(draftId);
          if (res.success && res.data) {
            // Map the draftJson to the form data structure
            const draftJson = res.data.draftJson;
            // The AI might return items, but PurchaseRequestForm expects category/quantity/estimatedCost
            // For Phase 9.4, we map the first item to the general fields, or just the top-level fields
            setInitialData({
              title: draftJson.title || '',
              department: draftJson.department || '',
              description: draftJson.description || (draftJson.items ? draftJson.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : ''),
              quantity: draftJson.items && draftJson.items[0] ? draftJson.items[0].quantity : 1,
              estimatedCost: draftJson.items && draftJson.items[0] ? draftJson.items[0].estimatedUnitPrice : '',
            });
            toast.success('AI Draft loaded successfully');
          }
        } catch (err) {
          toast.error('Failed to load AI draft or draft expired');
        } finally {
          setIsLoadingDraft(false);
        }
      };
      loadDraft();
    }
  }, [draftId]);

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

  if (isLoadingDraft) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Create Purchase Request"
        description="Draft a new request for procurement."
        backHref="/app/purchase-requests"
      />

      <PurchaseRequestForm 
        initialData={initialData}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        mode="create" 
      />
    </div>
  );
};

export default CreatePurchaseRequest;
