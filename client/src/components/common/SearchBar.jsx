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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
        <Search size={16} aria-hidden="true" />
      </div>
      <input
        type="text"
        aria-label={placeholder}
        className="block w-full rounded-md border border-border px-3 py-2 pl-9 text-sm transition-all duration-150 placeholder:text-surface-400 focus:outline-none focus-ring hover:border-border-hover bg-white"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
