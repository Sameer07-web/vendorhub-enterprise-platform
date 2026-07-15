import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, Palette, HelpCircle, LogOut } from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';

const UserMenuDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const currentUser = getCurrentUser() || { 
    name: 'Admin User', 
    email: 'admin@vendorhub.app',
    role: 'Administrator' 
  };
  
  const initials = currentUser.name?.charAt(0) || 'U';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: User, label: 'Profile', onClick: () => { navigate('/app/profile'); setIsOpen(false); } },
    { icon: Settings, label: 'Settings', onClick: () => { navigate('/app/settings'); setIsOpen(false); } },
    { icon: Bell, label: 'Notifications', onClick: () => { navigate('/app/settings?tab=notifications'); setIsOpen(false); } },
    { icon: Palette, label: 'Appearance', onClick: () => { navigate('/app/settings?tab=appearance'); setIsOpen(false); } },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => { navigate('/app/help'); setIsOpen(false); }, divider: true },
    { icon: LogOut, label: 'Log out', onClick: handleLogout, danger: true },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus-ring rounded-md p-1 hover:bg-surface-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex flex-col items-end hidden sm:flex text-right">
          <span className="text-sm font-semibold text-surface-900 leading-tight">{currentUser.name || 'User'}</span>
          <span className="text-xs text-surface-500 font-medium">{currentUser.role}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold shadow-sm border border-primary-200/50">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-floating z-50 animate-scale-in origin-top-right overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-50">
            <p className="text-sm font-semibold text-surface-900 truncate">{currentUser.name || 'User'}</p>
            <p className="text-xs text-surface-500 truncate mt-0.5">{currentUser.email || 'user@vendorhub.app'}</p>
          </div>
          
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  <button
                    onClick={item.onClick}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                      item.danger 
                        ? 'text-error-600 hover:bg-error-50 hover:text-error-700' 
                        : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'
                    }`}
                    role="menuitem"
                  >
                    <Icon size={16} className={item.danger ? 'text-error-500' : 'text-surface-400'} />
                    {item.label}
                  </button>
                  {item.divider && <div className="border-t border-border my-1" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenuDropdown;
