import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = 'Search...', className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        aria-label={placeholder}
        className="block w-full py-2 pl-9 pr-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white placeholder:text-slate-400 transition-all duration-200"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
