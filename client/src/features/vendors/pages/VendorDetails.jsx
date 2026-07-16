import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit } from 'lucide-react';
import { getVendorById } from '../../../api/vendor.api';
import VendorCard from '../components/VendorCard';
import Loader from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (isLoading) {
    return <div className="max-w-4xl mx-auto mt-8"><Loader rows={8} /></div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <EmptyState 
          title="Vendor Not Found" 
          message={error}
          actionLabel="Back to Vendors"
          onAction={() => navigate('/app/vendors')}
        />
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Vendor Details"
        description="Detailed profile and business information."
        backHref="/app/vendors"
        action={
          <Button onClick={() => navigate(`/app/vendors/${id}/edit`)} variant="secondary" className="shrink-0 bg-white shadow-sm">
            <Edit size={16} className="mr-2" />
            Edit Vendor
          </Button>
        }
      />
      <VendorCard vendor={vendor} />
    </div>
  );
};

export default VendorDetails;
