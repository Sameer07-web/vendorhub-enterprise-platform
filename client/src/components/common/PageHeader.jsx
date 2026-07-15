import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  description, 
  breadcrumbs = [], 
  action, 
  onBack,
  backHref 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      navigate(backHref);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between animate-fade-in mb-6">
      <div className="flex items-start gap-3">
        {(onBack || backHref) && (
          <button 
            onClick={handleBack}
            className="mt-1 p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-full transition-colors shrink-0 focus-ring"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-sm text-surface-500 mb-2 font-medium">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {crumb.href ? (
                    <Link to={crumb.href} className="hover:text-primary-600 transition-colors focus-ring rounded-sm">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-surface-900">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <ChevronRight size={14} className="text-surface-400" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-surface-500 mt-1 max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-3 shrink-0 self-start">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
