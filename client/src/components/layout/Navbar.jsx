import React from 'react';
import { Menu, Bell, User, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const user = currentUser || { role: 'User' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-border shadow-subtle z-20 sticky top-0">
      <div className="flex items-center flex-1">
        <button
          onClick={onMenuClick}
          aria-label="Toggle Menu"
          className="mr-4 p-1.5 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-md lg:hidden focus-ring transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Mockup */}
        <div className="hidden md:flex items-center max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-surface-400" />
          </div>
          <input
            type="text"
            placeholder="Search vendors, requests, or POs... (Ctrl+K)"
            className="block w-full pl-9 pr-3 py-1.5 border border-border rounded-md leading-5 bg-surface-50 placeholder-surface-400 focus:bg-white focus-ring sm:text-sm transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-md transition-colors focus-ring">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-border">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-surface-900 leading-tight">Admin User</span>
            <span className="text-xs text-surface-500 font-medium">{user.role}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold shadow-sm border border-primary-200/50">
            {user.role?.charAt(0) || 'U'}
          </div>
          
          <button 
            onClick={handleLogout}
            className="ml-2 p-1.5 text-surface-400 hover:text-error-600 hover:bg-error-50 rounded-md transition-colors focus-ring"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
