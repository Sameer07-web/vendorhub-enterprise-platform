import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, FileSearch, ShoppingCart, Settings, X, ClipboardCheck, Hexagon, User } from 'lucide-react';
import { isManager, isAdmin } from '../../utils/permissions';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'Vendors', path: '/app/vendors', icon: Users },
    { label: 'Purchase Requests', path: '/app/purchase-requests', icon: FileText },
    ...(isManager() || isAdmin() ? [{ label: 'Approvals', path: '/app/purchase-requests/approval', icon: ClipboardCheck }] : []),
    { label: 'RFQs', path: '/app/rfqs', icon: FileSearch },
    { label: 'Purchase Orders', path: '/app/purchase-orders', icon: ShoppingCart },
    { label: 'Quotations', path: '/app/quotations', icon: ClipboardCheck },
    { label: 'Profile', path: '/app/profile', icon: User },
  ];
  
  const bottomNavItems = [
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-surface-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-surface-900 border-r border-surface-800 flex flex-col transform transition-transform duration-150 lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-surface-800">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 flex items-center justify-center bg-primary-600 rounded-lg shadow-sm">
              <Hexagon size={18} className="text-white fill-current opacity-80" />
            </div>
            <span className="text-lg font-bold tracking-wide">VendorHub</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-md text-surface-400 hover:text-white hover:bg-surface-800 transition-colors focus-ring">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-md transition-all duration-150 group ${
                    isActive
                      ? 'bg-primary-600/10 text-primary-400 font-medium'
                      : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
                  }`
                }
              >
                <Icon size={18} className="mr-3 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-surface-800">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-md transition-all duration-150 group ${
                    isActive
                      ? 'bg-primary-600/10 text-primary-400 font-medium'
                      : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
                  }`
                }
              >
                <Icon size={18} className="mr-3 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
