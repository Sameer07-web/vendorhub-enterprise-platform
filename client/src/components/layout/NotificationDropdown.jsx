import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, clearRead } from '../../api/notification.api';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

const getIcon = (type, iconStr) => {
  if (iconStr === 'Shield') return <CheckCircle className="text-primary-500 w-5 h-5" />;
  switch (type) {
    case 'PR_APPROVED':
    case 'RFQ_AWARDED':
      return <CheckCircle className="text-success-500 w-5 h-5" />;
    case 'PR_REJECTED':
      return <AlertTriangle className="text-error-500 w-5 h-5" />;
    case 'PR_SUBMITTED':
    case 'RFQ_INVITED':
      return <Info className="text-primary-500 w-5 h-5" />;
    case 'SYSTEM':
      return <AlertTriangle className="text-warning-500 w-5 h-5" />;
    default: return <Info className="text-surface-500 w-5 h-5" />;
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      if (res.success) setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setUnreadCount(prev => prev + 1);
      
      // Update dropdown list if it's open
      setNotifications(prev => {
        const newList = [notif, ...prev];
        return newList.slice(0, 5); // Keep top 5
      });
      
      toast(notif.title, {
        icon: '🔔',
        style: {
          borderRadius: '10px',
          background: '#1E293B',
          color: '#fff',
        },
      });
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const res = await getNotifications({ page: 1, limit: 5 }); // Just recent ones for dropdown
          if (res.success) {
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
          }
        } catch (err) {
          console.error('Failed to load notifications:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearRead = async (e) => {
    e.stopPropagation();
    try {
      await clearRead();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (err) {
      toast.error("Failed to clear read notifications");
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
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
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-lg shadow-floating z-50 animate-scale-in origin-top-right overflow-hidden flex flex-col max-h-[32rem]">
          <div className="px-4 py-3 border-b border-border bg-surface-50 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-surface-900">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors" title="Mark all read">
                  <Check size={14} className="inline mr-1" />Read All
                </button>
                <button onClick={handleClearRead} className="text-xs font-medium text-surface-500 hover:text-error-600 transition-colors" title="Clear read">
                  <X size={14} className="inline mr-1" />Clear
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-surface-500">Loading...</div>
            ) : notifications.length === 0 ? (
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
                    key={notif._id} 
                    className={`px-4 py-3 hover:bg-surface-50 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notif.type, notif.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-surface-600 mt-0.5 line-clamp-2 leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-xs text-surface-400 mt-1.5 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="shrink-0 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-surface-50 p-2 text-center">
            <button 
              onClick={() => { setIsOpen(false); navigate('/app/notifications'); }}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 w-full py-1 rounded hover:bg-primary-50 transition-colors flex items-center justify-center gap-1"
            >
              View all notifications <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
