import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createVendor } from '../../../api/vendor.api';
import VendorForm from '../components/VendorForm';
import PageHeader from '../../../components/common/PageHeader';

const CreateVendor = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await createVendor(data);
      if (response.success) {
        toast.success('Vendor created successfully');
        navigate('/app/vendors');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create vendor';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Create New Vendor"
        description="Add a new vendor to the procurement system."
        backHref="/app/vendors"
      />
      <VendorForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CreateVendor;
