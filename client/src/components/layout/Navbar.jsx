import React from 'react';
import { Menu, Search } from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearch from './GlobalSearch';

const Navbar = ({ onMenuClick }) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-surface border-b border-border shadow-subtle z-20 sticky top-0 transition-colors duration-150">
      <div className="flex items-center flex-1">
        <button
          onClick={onMenuClick}
          aria-label="Toggle Menu"
          className="mr-4 p-1.5 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-md lg:hidden focus-ring transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Mockup converted to trigger */}
        <div className="hidden md:flex items-center max-w-md w-full relative">
          <button 
            className="w-full flex items-center pl-3 pr-3 py-1.5 border border-border rounded-md bg-surface-50 hover:bg-surface-100 text-surface-400 transition-colors focus-ring text-left sm:text-sm"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={16} className="mr-2" />
            <span className="flex-1">Search vendors, requests, or POs...</span>
            <span className="hidden sm:block text-xs border border-surface-200 rounded px-1.5 py-0.5 bg-surface text-surface-500 font-mono shadow-sm">
              Ctrl+K
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationDropdown />
        <div className="h-6 w-px bg-border hidden sm:block"></div>
        <UserMenuDropdown />
      </div>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

export default Navbar;
