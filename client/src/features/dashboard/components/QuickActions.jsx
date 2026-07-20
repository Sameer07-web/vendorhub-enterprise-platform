import React from 'react';
import { Card, CardBody } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { Plus, Users, Activity, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-br from-surface-900 to-surface-800 text-white border-transparent shadow-floating overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 opacity-20 rounded-full blur-3xl -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500 opacity-20 rounded-full blur-3xl -ml-10 -mb-10" />
      
      <CardBody className="p-6 relative z-10">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="secondary" 
            className="w-full bg-white/10 hover:bg-white/20 text-white border-transparent text-sm py-2.5 justify-start pl-3"
            onClick={() => navigate('/app/purchase-requests/new')}
            startIcon={Plus}
          >
            New Request
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full bg-white/10 hover:bg-white/20 text-white border-transparent text-sm py-2.5 justify-start pl-3"
            onClick={() => navigate('/app/vendors/new')}
            startIcon={Users}
          >
            Add Vendor
          </Button>

          <Button 
            variant="secondary" 
            className="w-full bg-white/10 hover:bg-white/20 text-white border-transparent text-sm py-2.5 justify-start pl-3"
            onClick={() => navigate('/app/rfqs/new')}
            startIcon={Activity}
          >
            Create RFQ
          </Button>

          <Button 
            variant="secondary" 
            className="w-full bg-white/10 hover:bg-white/20 text-white border-transparent text-sm py-2.5 justify-start pl-3"
            onClick={() => toast.success('Report generation started...')}
            startIcon={FileText}
          >
            Run Report
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default QuickActions;
