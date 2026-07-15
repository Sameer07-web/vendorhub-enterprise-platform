import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'approval', title: 'Purchase Request Approved', message: 'PR-1042 has been approved by Finance.', time: '5m ago', read: false },
  { id: 2, type: 'alert', title: 'Vendor Compliance Alert', message: 'GlobalTech Solutions insurance expires in 15 days.', time: '2h ago', read: false },
  { id: 3, type: 'system', title: 'System Update', message: 'VendorHub will undergo scheduled maintenance this Sunday at 2 AM EST.', time: '1d ago', read: true },
];

const getIcon = (type) => {
  switch (type) {
    case 'approval': return <CheckCircle className="text-success-500 w-5 h-5" />;
    case 'alert': return <AlertTriangle className="text-warning-500 w-5 h-5" />;
    default: return <Info className="text-primary-500 w-5 h-5" />;
  }
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-md transition-colors focus-ring"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-lg shadow-floating z-50 animate-scale-in origin-top-right overflow-hidden flex flex-col max-h-[32rem]">
          <div className="px-4 py-3 border-b border-border bg-surface-50 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-surface-900">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button onClick={markAllRead} className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" title="Mark all read">
                  <Check size={14} className="inline mr-1" />Read All
                </button>
                <button onClick={clearAll} className="text-xs font-medium text-surface-500 hover:text-error-600 transition-colors" title="Clear all">
                  <X size={14} className="inline mr-1" />Clear
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="text-surface-400 w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-surface-900">You're all caught up!</p>
                <p className="text-xs text-surface-500 mt-1">Check back later for new alerts.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 hover:bg-surface-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-primary-50/30' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-surface-600 mt-0.5 line-clamp-2 leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-xs text-surface-400 mt-1.5 font-medium">
                        {notif.time}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="shrink-0 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t border-border bg-surface-50 text-center shrink-0">
              <Button variant="ghost" className="w-full text-xs h-8 text-primary-600">
                View All Settings
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
