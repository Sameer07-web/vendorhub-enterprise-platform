import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          aria-label="Toggle Menu"
          className="mr-4 text-slate-500 hover:text-slate-700 lg:hidden focus:outline-none"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-slate-500 hover:text-slate-700 focus:outline-none relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            <User size={16} />
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-slate-700">Admin User</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 ml-4"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
