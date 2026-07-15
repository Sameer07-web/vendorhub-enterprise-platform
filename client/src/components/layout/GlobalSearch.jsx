import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, FileSearch, ArrowRight, X } from 'lucide-react';

const SEARCH_DATA = [
  { id: '1', type: 'vendor', title: 'GlobalTech Solutions', subtitle: 'Software & Cloud', url: '/app/vendors/1' },
  { id: '2', type: 'vendor', title: 'Apex Manufacturing', subtitle: 'Hardware', url: '/app/vendors/2' },
  { id: '3', type: 'pr', title: 'PR-1042', subtitle: 'Q3 Developer Laptops - $42,500', url: '/app/purchase-requests/1' },
  { id: '4', type: 'pr', title: 'PR-1089', subtitle: 'AWS Cloud Hosting Renewal', url: '/app/purchase-requests/2' },
  { id: '5', type: 'rfq', title: 'RFQ-2023-01', subtitle: 'Enterprise CRM Migration', url: '/app/rfqs/1' }
];

const getIcon = (type) => {
  switch (type) {
    case 'vendor': return <Users className="w-4 h-4 text-primary-500" />;
    case 'pr': return <FileText className="w-4 h-4 text-success-500" />;
    case 'rfq': return <FileSearch className="w-4 h-4 text-warning-500" />;
    default: return <FileText className="w-4 h-4 text-surface-400" />;
  }
};

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = query.length > 0 
    ? SEARCH_DATA.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_DATA.slice(0, 3); // Show recent by default

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        navigate(results[activeIndex].url);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-surface-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-surface rounded-xl shadow-floating overflow-hidden border border-border animate-scale-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-border bg-surface-50 shrink-0">
          <Search className="w-5 h-5 text-surface-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 py-4 bg-transparent border-0 focus:ring-0 text-surface-900 placeholder-surface-400 text-lg outline-none"
            placeholder="Search vendors, requests, RFQs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 rounded-md text-surface-400 hover:text-surface-600 hover:bg-surface-200 transition-colors focus-ring">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] py-2">
          {results.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                {query.length > 0 ? 'Results' : 'Recent'}
              </div>
              <ul className="px-2">
                {results.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li key={item.id}>
                      <button
                        className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                          isActive ? 'bg-primary-50 text-primary-900 ring-1 ring-primary-500/20' : 'hover:bg-surface-50'
                        }`}
                        onClick={() => {
                          navigate(item.url);
                          onClose();
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm' : 'bg-surface-100'}`}>
                          {getIcon(item.type)}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-900' : 'text-surface-900'}`}>{item.title}</p>
                          <p className="text-xs text-surface-500 truncate mt-0.5">{item.subtitle}</p>
                        </div>
                        {isActive && <ArrowRight className="w-4 h-4 text-primary-500 shrink-0 ml-3" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="py-14 px-6 text-center">
              <Search className="w-8 h-8 text-surface-300 mx-auto mb-4" />
              <p className="text-surface-900 font-medium">No results found for "{query}"</p>
              <p className="text-surface-500 text-sm mt-1">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-border bg-surface-50 px-4 py-2.5 flex items-center gap-4 text-xs text-surface-500 shrink-0">
          <span className="flex items-center gap-1"><kbd className="bg-surface-200 px-1.5 py-0.5 rounded text-surface-700 font-mono text-[10px]">↑</kbd> <kbd className="bg-surface-200 px-1.5 py-0.5 rounded text-surface-700 font-mono text-[10px]">↓</kbd> to navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-surface-200 px-1.5 py-0.5 rounded text-surface-700 font-mono text-[10px]">Enter</kbd> to select</span>
          <span className="flex items-center gap-1"><kbd className="bg-surface-200 px-1.5 py-0.5 rounded text-surface-700 font-mono text-[10px]">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
