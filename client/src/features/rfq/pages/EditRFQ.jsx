import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { getRFQById } from '../../../api/rfq.api';
import RFQForm from '../components/RFQForm';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';

const EditRFQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const response = await getRFQById(id);
        if (response.success) {
          // Only Drafts can be edited
          if (response.data.status !== 'DRAFT') {
            toast.error('Only DRAFT RFQs can be edited');
            navigate(`/rfqs/${id}`);
            return;
          }
          setRfq(response.data);
        }
      } catch {
        setError('Failed to load RFQ. It may have been deleted or the server is down.');
      } finally {
        setLoading(false);
      }
    };
    fetchRFQ();
  }, [id, navigate]);

  if (loading) return <Loader rows={8} />;
  
  if (error) return <EmptyState title="Error Loading RFQ" message={error} actionLabel="Go Back" onAction={() => navigate('/rfqs')} />;

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
          <h1 className="text-2xl font-bold text-slate-900">Edit Draft RFQ</h1>
          <p className="text-sm text-slate-500 mt-1">{rfq.rfqNumber} — {rfq.title}</p>
        </div>
      </div>
      
      <RFQForm initialData={rfq} mode="edit" />
    </div>
  );
};

export default EditRFQ;
