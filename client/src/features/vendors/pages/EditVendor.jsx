import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getVendorById, updateVendor } from '../../../api/vendor.api';
import VendorForm from '../components/VendorForm';
import Loader from '../../../components/common/Loader';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';

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
        navigate('/app/vendors');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update vendor';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto mt-8"><Loader rows={12} /></div>;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8">
        <EmptyState 
          title="Vendor Not Found" 
          message={error}
          actionLabel="Back to Vendors"
          onAction={() => navigate('/app/vendors')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Edit Vendor"
        description={`Update information for ${vendor?.companyName}.`}
        backHref="/app/vendors"
      />
      <VendorForm initialData={vendor} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditVendor;
