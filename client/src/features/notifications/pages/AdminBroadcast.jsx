import React, { useState } from 'react';
import { createBroadcast } from '../../../api/notification.api';
import PageHeader from '../../../components/common/PageHeader';
import { Card } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';
import { Send, Megaphone, Users, AlertCircle, Link } from 'lucide-react';
import { getCurrentUser } from '../../../utils/auth';
import { Navigate } from 'react-router-dom';

const AdminBroadcast = () => {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'MEDIUM',
    targetAudience: 'All',
    actionUrl: ''
  });

  if (user?.role !== 'Admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    if (window.confirm(`Are you sure you want to send this broadcast to ${formData.targetAudience} users?`)) {
      setLoading(true);
      try {
        const res = await createBroadcast(formData);
        if (res.success) {
          toast.success('Broadcast sent successfully!');
          setFormData({
            title: '',
            message: '',
            priority: 'MEDIUM',
            targetAudience: 'All',
            actionUrl: ''
          });
        }
      } catch (err) {
        toast.error(err.message || 'Failed to send broadcast');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader 
        title="Admin Broadcasts" 
        subtitle="Send system-wide announcements to users"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-6 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary-500" />
              Compose Broadcast
            </h3>
            
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Target Audience *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="All">All Active Users</option>
                    <option value="Managers">Managers Only</option>
                    <option value="Employees">Employees Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Priority</label>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Scheduled System Maintenance"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Type your announcement here..."
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Action URL (Optional)</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                  <input
                    type="text"
                    name="actionUrl"
                    value={formData.actionUrl}
                    onChange={handleChange}
                    placeholder="e.g., /app/system/maintenance"
                    className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-surface-500 mt-1">Make the notification clickable (relative or absolute URL).</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  icon={Send} 
                  isLoading={loading}
                >
                  Send Broadcast
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <Card className="p-6 bg-surface-50 border-dashed border-2 border-border h-full flex flex-col">
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-6 flex items-center justify-center">
              Live Preview
            </h3>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm bg-surface shadow-xl rounded-xl border border-border overflow-hidden">
                <div className="p-4 flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                      <Megaphone className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-surface-900 break-words">
                      {formData.title || "Broadcast Title"}
                      <span className="inline-block ml-2 w-2 h-2 rounded-full bg-primary-500 align-middle"></span>
                    </h4>
                    <p className="text-surface-600 mt-1 text-sm break-words whitespace-pre-wrap">
                      {formData.message || "Your broadcast message will appear here..."}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        formData.priority === 'CRITICAL' ? 'bg-error-100 text-error-700' :
                        formData.priority === 'HIGH' ? 'bg-warning-100 text-warning-700' :
                        formData.priority === 'LOW' ? 'bg-surface-200 text-surface-700' :
                        'bg-primary-100 text-primary-700'
                      }`}>
                        {formData.priority}
                      </span>
                      <span className="text-xs font-medium text-surface-400">Just now</span>
                    </div>
                  </div>
                </div>
                {formData.actionUrl && (
                  <div className="bg-surface-50 px-4 py-3 border-t border-border flex justify-end">
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View Details</button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center mt-6 text-sm text-surface-500">
              This is how the notification will appear in the user's Notification Center.
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminBroadcast;
