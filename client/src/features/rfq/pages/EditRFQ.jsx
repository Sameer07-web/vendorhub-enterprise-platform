import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRFQById } from '../../../api/rfq.api';
import RFQForm from '../components/RFQForm';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import PageHeader from '../../../components/common/PageHeader';

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
          if (response.data.status !== 'Draft') {
            toast.error('Only Draft RFQs can be edited');
            navigate(`/app/rfqs/${id}`);
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

  if (loading) return <div className="max-w-4xl mx-auto mt-8"><Loader rows={8} /></div>;
  
  if (error) return (
    <div className="max-w-4xl mx-auto mt-8">
      <EmptyState title="Error Loading RFQ" message={error} actionLabel="Go Back" onAction={() => navigate('/app/rfqs')} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Edit Draft RFQ"
        description={`${rfq.rfqNumber} — ${rfq.title}`}
        backHref="/app/rfqs"
      />
      <RFQForm initialData={rfq} mode="edit" />
    </div>
  );
};

export default EditRFQ;
