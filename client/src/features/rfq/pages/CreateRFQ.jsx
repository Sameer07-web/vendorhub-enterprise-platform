import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import RFQForm from '../components/RFQForm';
import PageHeader from '../../../components/common/PageHeader';
import { getAIDraft } from '../../../api/ai.api';
import Loader from '../../../components/common/Loader';

const CreateRFQ = () => {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  const [initialData, setInitialData] = useState(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(!!draftId);

  useEffect(() => {
    if (draftId) {
      const loadDraft = async () => {
        try {
          const res = await getAIDraft(draftId);
          if (res.success && res.data) {
            setInitialData(res.data.draftJson);
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

  if (isLoadingDraft) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Create Request For Quotation"
        description="Draft a new Request for Quotation."
        backHref="/app/rfqs"
      />
      <RFQForm mode="create" initialData={initialData} />
    </div>
  );
};

export default CreateRFQ;
