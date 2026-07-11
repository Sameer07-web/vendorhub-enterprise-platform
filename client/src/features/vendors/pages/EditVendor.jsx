import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { getVendorById, updateVendor } from '../../../api/vendor.api';
import VendorForm from '../components/VendorForm';
import Loader from '../../../components/common/Loader';

const EditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await getVendorById(id);
        if (response.success) {
          setVendor(response.data);
        }
      } catch {
        setError('Failed to load vendor details. Please ensure the backend is available.');
        toast.error('Failed to load vendor details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendor();
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await updateVendor(id, data);
      if (response.success) {
        toast.success('Vendor updated successfully');
        navigate('/vendors');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update vendor';
      toast.error(message);
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
          <button onClick={() => navigate('/vendors')} className="mt-4 text-sm font-medium hover:underline">
            &larr; Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/vendors')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Vendor</h1>
          <p className="text-sm text-slate-500 mt-1">Update information for {vendor?.companyName}.</p>
        </div>
      </div>

      <VendorForm initialData={vendor} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditVendor;
