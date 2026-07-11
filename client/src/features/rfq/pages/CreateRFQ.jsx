import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RFQForm from '../components/RFQForm';

const CreateRFQ = () => {
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold text-slate-900">Create Request For Quotation</h1>
          <p className="text-sm text-slate-500 mt-1">Convert an approved Purchase Request into an RFQ.</p>
        </div>
      </div>
      
      <RFQForm mode="create" />
    </div>
  );
};

export default CreateRFQ;
