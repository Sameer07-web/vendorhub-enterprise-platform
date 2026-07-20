import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../../utils/auth';
import { updatePreferences } from '../../../api/auth.api';
import PageHeader from '../../../components/common/PageHeader';
import { Card } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';
import { Save, Bell, Mail, ShieldAlert, FileText, Users, ShoppingCart, Activity } from 'lucide-react';

const NotificationSettings = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);
  
  // Local state for preferences
  const [prefs, setPrefs] = useState({
    email: { enabled: true, digest: 'instant' },
    inApp: { enabled: true },
    categories: {
      purchaseRequests: true,
      rfqs: true,
      vendors: true,
      quotations: true,
      system: true,
      broadcasts: true
    }
  });

  useEffect(() => {
    if (user && user.notificationPreferences) {
      setPrefs({
        email: { ...prefs.email, ...user.notificationPreferences.email },
        inApp: { ...prefs.inApp, ...user.notificationPreferences.inApp },
        categories: { ...prefs.categories, ...user.notificationPreferences.categories }
      });
    }
  }, [user]);

  const handleToggleCategory = (key) => {
    setPrefs(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [key]: !prev.categories[key]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updatePreferences(prefs);
      if (res.status === 'success') {
        const updatedUser = { ...user, notificationPreferences: res.data.notificationPreferences };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Notification preferences updated');
      }
    } catch (err) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'purchaseRequests', label: 'Purchase Requests', icon: ShoppingCart, desc: 'Approvals, rejections, and submissions' },
    { key: 'rfqs', label: 'RFQs', icon: FileText, desc: 'Invitations and awards' },
    { key: 'vendors', label: 'Vendors', icon: Users, desc: 'New registrations and updates' },
    { key: 'quotations', label: 'Quotations', icon: FileText, desc: 'Quotation submissions and statuses' },
    { key: 'broadcasts', label: 'Admin Broadcasts', icon: Bell, desc: 'Company-wide announcements' },
    { key: 'system', label: 'System Alerts', icon: ShieldAlert, desc: 'Security and system maintenance (Required)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Notification Settings" 
        subtitle="Manage how and when you receive alerts"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Delivery Channels */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              Delivery Channels
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
                  checked={prefs.inApp.enabled}
                  onChange={(e) => setPrefs(prev => ({ ...prev, inApp: { ...prev.inApp, enabled: e.target.checked } }))}
                />
                <div>
                  <div className="font-medium text-surface-900">In-App Notifications</div>
                  <div className="text-sm text-surface-500">Real-time alerts while using the app</div>
                </div>
              </label>

              <div className="h-px bg-border"></div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
                  checked={prefs.email.enabled}
                  onChange={(e) => setPrefs(prev => ({ ...prev, email: { ...prev.email, enabled: e.target.checked } }))}
                />
                <div>
                  <div className="font-medium text-surface-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Notifications
                  </div>
                  <div className="text-sm text-surface-500">Receive alerts in your inbox</div>
                </div>
              </label>
              
              {prefs.email.enabled && (
                <div className="pl-7 pt-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">Email Digest</label>
                  <select 
                    className="w-full border border-border rounded-md px-3 py-1.5 text-sm"
                    value={prefs.email.digest}
                    onChange={(e) => setPrefs(prev => ({ ...prev, email: { ...prev.email, digest: e.target.value } }))}
                  >
                    <option value="instant">Instant (As they happen)</option>
                    <option value="daily" disabled>Daily Summary (Coming Soon)</option>
                    <option value="weekly" disabled>Weekly Summary (Coming Soon)</option>
                  </select>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Notification Categories</h3>
            <p className="text-sm text-surface-500 mb-6">Choose which types of events you want to be notified about. These settings apply to both In-App and Email channels.</p>
            
            <div className="space-y-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isRequired = cat.key === 'system';
                
                return (
                  <div key={cat.key} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-surface-900">{cat.label} {isRequired && <span className="text-xs text-error-500 font-normal ml-2">Required</span>}</div>
                        <div className="text-sm text-surface-500">{cat.desc}</div>
                      </div>
                    </div>
                    <div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isRequired ? true : prefs.categories[cat.key]}
                          disabled={isRequired}
                          onChange={() => handleToggleCategory(cat.key)}
                        />
                        <div className={`w-11 h-6 bg-surface-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer ${isRequired ? 'opacity-50' : 'peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500'}`}></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSave} 
                icon={Save} 
                isLoading={loading}
              >
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default NotificationSettings;
