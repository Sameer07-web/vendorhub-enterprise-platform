import React from 'react';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-sm border border-error-200 p-8 max-w-md text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
            <h3 className="text-lg font-medium text-surface-900 mb-2">Something went wrong</h3>
            <p className="text-sm text-surface-500 mb-6">
              An unexpected error occurred in this module. Our team has been notified.
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
