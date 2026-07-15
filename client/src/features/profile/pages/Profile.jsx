import React, { useState } from 'react';
import { Camera, Mail, Building, Briefcase, Key, Activity, Clock, Shield } from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { getCurrentUser } from '../../../utils/auth';
import toast from 'react-hot-toast';

const Profile = () => {
  const user = getCurrentUser() || {
    name: 'Admin User',
    email: 'admin@vendorhub.app',
    role: 'Administrator',
    department: 'Procurement'
  };

  const initials = user.name?.split(' ').map(n => n[0]).join('') || 'U';

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Your Profile</h1>
        <p className="text-surface-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Info & Activity */}
        <div className="space-y-6">
          <div className="card-base p-6">
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl shadow-sm border-2 border-white ring-2 ring-primary-50">
                  {initials}
                </div>
                <div className="absolute inset-0 bg-surface-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-6 h-6" />
                </div>
              </div>
              <h2 className="mt-4 text-lg font-bold text-surface-900">{user.name}</h2>
              <p className="text-surface-500 text-sm font-medium">{user.role}</p>
              
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-success-600 bg-success-50 px-2.5 py-1 rounded-full border border-success-200">
                <Shield size={14} /> Account Active
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6 space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-surface-400 mr-3" />
                <span className="text-surface-700">{user.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Briefcase className="w-4 h-4 text-surface-400 mr-3" />
                <span className="text-surface-700">{user.role}</span>
              </div>
              <div className="flex items-center text-sm">
                <Building className="w-4 h-4 text-surface-400 mr-3" />
                <span className="text-surface-700">{user.department}</span>
              </div>
            </div>
          </div>

          <div className="card-base p-6">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} className="text-primary-500" /> Recent Activity
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-border">
              {[
                { action: 'Approved PR-1042', time: '2 hours ago' },
                { action: 'Logged in from Windows', time: '5 hours ago' },
                { action: 'Updated vendor status', time: '1 day ago' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className="w-4 h-4 rounded-full bg-surface-200 ring-4 ring-surface flex-shrink-0 z-10" />
                  <div>
                    <p className="text-sm font-medium text-surface-900">{item.action}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface-50/50">
              <h3 className="text-base font-semibold text-surface-900">Personal Information</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                  <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} disabled helperText="Contact IT to change your email." />
                  <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
                  <Input label="Role" value={user.role} disabled helperText="Your role is assigned by your administrator." />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>

          <div className="card-base overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-surface-50/50 flex items-center justify-between">
              <h3 className="text-base font-semibold text-surface-900 flex items-center gap-2">
                <Key size={18} className="text-surface-400" /> Security
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="max-w-md space-y-5">
                  <Input label="Current Password" name="currentPassword" type="password" required value={formData.currentPassword} onChange={handleChange} />
                  <Input label="New Password" name="newPassword" type="password" required value={formData.newPassword} onChange={handleChange} />
                  <Input label="Confirm New Password" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? "Passwords do not match" : null} />
                </div>
                <div className="pt-2">
                  <Button type="submit" variant="secondary">Update Password</Button>
                </div>
              </form>
            </div>
          </div>

          <div className="card-base p-6">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">Active Sessions</h3>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
                  <Clock size={18} className="text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">Current Session</p>
                  <p className="text-xs text-surface-500">Windows • Chrome • IP: 192.168.1.1</p>
                </div>
              </div>
              <span className="text-xs font-bold text-success-600 bg-success-50 px-2 py-1 rounded">Active Now</span>
            </div>
            <div className="pt-4">
              <Button variant="danger" className="text-xs">Terminate All Other Sessions</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
