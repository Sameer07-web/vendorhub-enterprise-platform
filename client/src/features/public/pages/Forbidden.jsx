import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import Button from '../../../components/common/Button';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="mx-auto h-16 w-16 bg-error-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-error-50/50">
          <ShieldX className="h-8 w-8 text-error-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight">403</h1>
        <h2 className="mt-2 text-xl font-semibold text-surface-700">Access Denied</h2>
        <p className="mt-4 text-surface-500 text-sm leading-relaxed">
          You do not have the necessary permissions to view this resource. This action has been logged according to enterprise security policies.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)} startIcon={ArrowLeft}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Sign In with Different Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
