import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <nav className="border-b border-surface-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 bg-primary-600 rounded flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
                <span className="text-lg font-bold text-white leading-none">V</span>
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">VendorHub</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Home</Link>
              <Link to="/architecture" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Architecture</Link>
              <Link to="/docs" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Documentation</Link>
              <Link to="/contact" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {token ? (
              <Button variant="primary" onClick={() => navigate('/app')}>
                Go to Dashboard
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
