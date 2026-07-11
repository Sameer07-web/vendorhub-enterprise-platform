import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import PurchaseRequestForm from '../components/PurchaseRequestForm';
import { getPurchaseRequestById, updatePurchaseRequest } from '../../../api/purchaseRequest.api';
import Loader from '../../../components/common/Loader';
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
            navigate(`/purchase-requests/${id}`);
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
      navigate(`/purchase-requests/${id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update Purchase Request');
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
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-lg mb-1">Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/purchase-requests')} className="mt-4 text-sm font-medium hover:underline">
            &larr; Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Purchase Request</h1>
          <p className="text-sm text-slate-500 mt-1">Update draft information for {initialData?.requestNumber}.</p>
        </div>
      </div>

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
