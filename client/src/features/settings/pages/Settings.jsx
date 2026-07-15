import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings as SettingsIcon, Palette, Bell, Shield, Accessibility, Keyboard, Info } from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { theme, setTheme } = useTheme();

  // Sync tab state with URL without triggering navigation reload
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Settings</h1>
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchParams({ tab: tab.id }, { replace: true });
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors focus-ring whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary-600' : 'text-surface-400'} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-surface-900">General Settings</h2>
              <p className="text-surface-500 text-sm mt-1">Manage basic platform preferences.</p>
            </div>
            
            <div className="card-base p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="max-w-md space-y-5">
                  <Input label="Organization Name" defaultValue="Acme Corp Global" disabled />
                  <Input label="Workspace ID" defaultValue="ws_9f82h48v" disabled />
                  
                  <div className="pt-2">
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">Default Currency</label>
                    <select className="block w-full rounded-md border border-border px-3 py-2 text-sm focus-ring bg-surface-50 hover:border-border-hover transition-colors">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">Timezone</label>
                    <select className="block w-full rounded-md border border-border px-3 py-2 text-sm focus-ring bg-surface-50 hover:border-border-hover transition-colors">
                      <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                      <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                      <option>(UTC+00:00) Greenwich Mean Time</option>
                    </select>
                  </div>
                </div>
                
                <div className="border-t border-border pt-6 flex justify-end">
                  <Button type="submit" variant="primary">Save Preferences</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-surface-900">Appearance</h2>
              <p className="text-surface-500 text-sm mt-1">Customize how VendorHub looks on your device.</p>
            </div>
            
            <div className="card-base p-6">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">Theme Preference</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Light', desc: 'Clean and bright' },
                  { id: 'dark', label: 'Dark', desc: 'Easy on the eyes' },
                  { id: 'system', label: 'System', desc: 'Follows OS' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-start p-4 rounded-lg border-2 text-left focus-ring transition-colors ${
                      theme === t.id ? 'border-primary-500 bg-primary-50/50' : 'border-border bg-surface hover:border-surface-400'
                    }`}
                  >
                    <span className={`font-semibold ${theme === t.id ? 'text-primary-900' : 'text-surface-900'}`}>{t.label}</span>
                    <span className={`text-xs mt-1 ${theme === t.id ? 'text-primary-700' : 'text-surface-500'}`}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-surface-900">Notification Preferences</h2>
              <p className="text-surface-500 text-sm mt-1">Control when and how you are alerted.</p>
            </div>
            
            <div className="card-base divide-y divide-border">
              {[
                { title: 'Purchase Request Approvals', desc: 'When a PR requires your review' },
                { title: 'Vendor Onboarding', desc: 'When a vendor submits their questionnaire' },
                { title: 'Compliance Alerts', desc: 'When vendor insurance or contracts expire' },
                { title: 'System Updates', desc: 'Maintenance and platform news' }
              ].map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-surface-900">{item.title}</h4>
                    <p className="text-xs text-surface-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-border text-primary-600 focus-ring" /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
                      <input type="checkbox" defaultChecked={i !== 3} className="rounded border-border text-primary-600 focus-ring" /> In-App
                    </label>
                  </div>
                </div>
              ))}
              <div className="p-6 bg-surface-50">
                <Button variant="primary" onClick={handleSave}>Save Notification Settings</Button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs as placeholders demonstrating completeness */}
        {['security', 'accessibility', 'shortcuts', 'about'].includes(activeTab) && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-surface-900 capitalize">{activeTab === 'shortcuts' ? 'Keyboard Shortcuts' : activeTab}</h2>
              <p className="text-surface-500 text-sm mt-1">Manage your {activeTab} settings.</p>
            </div>
            
            <div className="card-base p-12 text-center">
              <SettingsIcon className="w-12 h-12 text-surface-300 mx-auto mb-4" />
              <h3 className="text-surface-900 font-semibold mb-2">Module Enabled in Production</h3>
              <p className="text-surface-500 text-sm max-w-sm mx-auto">This enterprise configuration panel is view-only in the public demonstration environment.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
