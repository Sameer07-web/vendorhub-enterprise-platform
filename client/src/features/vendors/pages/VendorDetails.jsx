import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit } from 'lucide-react';
import { getVendorById } from '../../../api/vendor.api';
import VendorCard from '../components/VendorCard';
import Loader from '../../../components/common/Loader';
import Button from '../../../components/common/Button';

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
        <div className="bg-error-50 text-error-600 p-4 rounded-lg border border-error-200">
          <h3 className="font-semibold text-lg mb-1">Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/app/vendors')} className="mt-4 text-sm font-medium hover:underline flex items-center gap-1 focus-ring rounded p-1">
            <ArrowLeft size={16} /> Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app/vendors')}
            className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-full transition-colors shrink-0 focus-ring"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Vendor Details</h1>
            <p className="text-sm text-surface-500 mt-1">Detailed profile and business information.</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/vendors/${id}/edit`)} variant="secondary" className="shrink-0 bg-white shadow-sm">
          <Edit size={16} className="mr-2" />
          Edit Vendor
        </Button>
      </div>

      <VendorCard vendor={vendor} />
    </div>
  );
};

export default VendorDetails;
