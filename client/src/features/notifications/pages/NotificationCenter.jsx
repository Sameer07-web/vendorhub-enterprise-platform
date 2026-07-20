import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead, clearRead, deleteNotification } from '../../../api/notification.api';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import Pagination from '../../../components/common/Pagination';
import { Bell, Check, X, Search, Filter, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useSocket } from '../../../contexts/SocketContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const getIcon = (type, iconStr) => {
  if (iconStr === 'Shield') return <CheckCircle className="text-primary-500 w-5 h-5" />;
  switch (type) {
    case 'PR_APPROVED':
    case 'RFQ_AWARDED': return <CheckCircle className="text-success-500 w-5 h-5" />;
    case 'PR_REJECTED': return <AlertTriangle className="text-error-500 w-5 h-5" />;
    case 'PR_SUBMITTED':
    case 'RFQ_INVITED': return <Info className="text-primary-500 w-5 h-5" />;
    case 'SYSTEM': return <AlertTriangle className="text-warning-500 w-5 h-5" />;
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter === 'UNREAD') params.isRead = false;
      if (filter === 'READ') params.isRead = true;
      if (searchQuery) params.search = searchQuery;
      if (category) params.category = category;
      if (dateFilter) params.dateFilter = dateFilter;
      
      const res = await getNotifications(params);
      if (res.success) {
        setNotifications(res.data.notifications);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filter, category, dateFilter]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchNotifications();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      // If we are on page 1 and the filter is either ALL or UNREAD, add it to the list
      if (page === 1 && (filter === 'ALL' || filter === 'UNREAD')) {
        setNotifications(prev => [notif, ...prev].slice(0, 10)); // Keep pagination limit
      }
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, page, filter]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const handleClearRead = async () => {
    try {
      await clearRead();
      toast.success("Read notifications cleared");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleActionClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Notification Center" 
        subtitle="Manage your alerts and communications"
      >
        <div className="flex gap-2">
          <Button variant="secondary" icon={Check} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
          <Button variant="danger" icon={Trash2} onClick={handleClearRead}>
            Clear Read
          </Button>
        </div>
      </PageHeader>

      <Card>
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-50">
          <div className="flex bg-surface-100 p-1 rounded-lg">
            {['ALL', 'UNREAD', 'READ'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === f 
                    ? 'bg-surface shadow-sm text-surface-900' 
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search notifications..."
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="purchaseRequests">Purchase Requests</option>
              <option value="rfqs">RFQs</option>
              <option value="vendors">Vendors</option>
              <option value="quotations">Quotations</option>
              <option value="broadcasts">Broadcasts</option>
              <option value="system">System</option>
            </select>
            
            <select 
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            >
              <option value="">Any Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-border min-h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-surface-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4 text-surface-400">
                <Bell size={32} />
              </div>
              <h3 className="text-lg font-medium text-surface-900">No notifications found</h3>
              <p className="text-surface-500 mt-1 max-w-sm mx-auto">
                {filter === 'UNREAD' 
                  ? "You're all caught up! No unread notifications."
                  : "We'll notify you here when there's activity that requires your attention."}
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif._id} 
                onClick={() => handleActionClick(notif)}
                className={`p-4 hover:bg-surface-50 transition-colors flex gap-4 cursor-pointer group ${!notif.isRead ? 'bg-primary-50/20' : ''}`}
              >
                <div className="shrink-0 mt-1">
                  {getIcon(notif.type, notif.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-base ${!notif.isRead ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>
                        {notif.title}
                        {!notif.isRead && (
                          <span className="inline-block ml-2 w-2 h-2 rounded-full bg-primary-500 align-middle"></span>
                        )}
                      </h4>
                      <p className="text-surface-600 mt-1 text-sm">{notif.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs font-medium text-surface-400">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                      <button 
                        onClick={(e) => handleDelete(e, notif._id)}
                        className="text-surface-400 hover:text-error-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-center bg-surface-50">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationCenter;
