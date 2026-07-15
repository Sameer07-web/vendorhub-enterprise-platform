import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="mx-auto h-16 w-16 bg-surface-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-surface-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-surface-700">Page not found</h2>
        <p className="mt-4 text-surface-500 text-sm leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Please verify the URL or return to the application dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)} startIcon={ArrowLeft}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
