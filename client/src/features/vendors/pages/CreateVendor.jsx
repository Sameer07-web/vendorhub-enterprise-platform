import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { createVendor } from '../../../api/vendor.api';
import VendorForm from '../components/VendorForm';

const CreateVendor = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await createVendor(data);
      if (response.success) {
        toast.success('Vendor created successfully');
        navigate('/vendors');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create vendor';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Create New Vendor</h1>
          <p className="text-sm text-slate-500 mt-1">Add a new vendor to the procurement system.</p>
        </div>
      </div>

      <VendorForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateVendor;
