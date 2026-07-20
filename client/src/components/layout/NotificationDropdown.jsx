import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import { getDashboardStats } from '../../api/dashboard.api';

const getIcon = (type) => {
  switch (type) {
    case 'approval': return <CheckCircle className="text-success-500 w-5 h-5" />;
    case 'alert': return <AlertTriangle className="text-warning-500 w-5 h-5" />;
    default: return <Info className="text-primary-500 w-5 h-5" />;
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications derived from dashboard data when dropdown opens
  useEffect(() => {
    if (isOpen && !loaded) {
      const fetchNotifications = async () => {
        try {
          const res = await getDashboardStats();
          if (res.success) {
            const derived = [];
            
            // Pending approvals become notifications
            (res.data.pendingApprovals || []).forEach((pr, i) => {
              derived.push({
                id: `approval-${pr._id || i}`,
                type: 'approval',
                title: `PR Pending Approval`,
                message: `${pr.title} from ${pr.requester} requires your review.`,
                time: pr.date,
              });
            });

            // Recent activity items
            (res.data.activityTimelineData || []).forEach((item, i) => {
              derived.push({
                id: `activity-${item.id || i}`,
                type: item.type === 'warning' ? 'alert' : 'system',
                title: item.title,
                message: item.description,
                time: item.time,
              });
            });

            setNotifications(derived.slice(0, 8));
            setLoaded(true);
          }
        } catch (err) {
          console.error('Failed to load notifications:', err);
        }
      };
      fetchNotifications();
    }
  }, [isOpen, loaded]);

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const clearAll = () => {
    setNotifications([]);
    setReadIds(new Set());
  };

  const markAsRead = (id) => {
    setReadIds(prev => new Set([...prev, id]));
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
                    className={`px-4 py-3 hover:bg-surface-50 transition-colors cursor-pointer flex gap-3 ${!readIds.has(notif.id) ? 'bg-primary-50/30' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!readIds.has(notif.id) ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-surface-600 mt-0.5 line-clamp-2 leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-xs text-surface-400 mt-1.5 font-medium">
                        {formatTimeAgo(notif.time)}
                      </p>
                    </div>
                    {!readIds.has(notif.id) && (
                      <div className="shrink-0 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
