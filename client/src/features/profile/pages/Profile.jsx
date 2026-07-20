import React, { useState, useEffect } from 'react';
import { Camera, Mail, Building, Briefcase, Key, Activity, Shield } from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { getCurrentUser } from '../../../utils/auth';
import { getMe } from '../../../api/auth.api';
import { updateProfile, changePassword } from '../../../api/user.api';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(getCurrentUser() || {});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe();
        if (res.success) {
          const userData = res.data;
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            fullName: userData.fullName || '',
            email: userData.email || '',
            department: userData.department || '',
          }));
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const initials = (user.fullName || user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await updateProfile({
        fullName: formData.fullName,
        department: formData.department,
      });
      if (res.success) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setSavingPassword(true);
      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      if (res.success) {
        toast.success('Password updated successfully');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-200 rounded w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-surface border border-border rounded-lg h-80" />
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-border rounded-lg h-64" />
              <div className="bg-surface border border-border rounded-lg h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Your Profile</h1>
        <p className="text-surface-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Info */}
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
              <h2 className="mt-4 text-lg font-bold text-surface-900">{user.fullName || user.name}</h2>
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
              {user.department && (
                <div className="flex items-center text-sm">
                  <Building className="w-4 h-4 text-surface-400 mr-3" />
                  <span className="text-surface-700">{user.department}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card-base p-6">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} className="text-primary-500" /> Account Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Member since</span>
                <span className="text-surface-700 font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Role</span>
                <span className="text-surface-700 font-medium">{user.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Status</span>
                <span className="text-success-600 font-medium">Active</span>
              </div>
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
                  <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                  <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} disabled helperText="Contact IT to change your email." />
                  <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
                  <Input label="Role" value={user.role} disabled helperText="Your role is assigned by your administrator." />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
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
                  <Input label="New Password" name="newPassword" type="password" required value={formData.newPassword} onChange={handleChange} helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number" />
                  <Input label="Confirm New Password" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? "Passwords do not match" : null} />
                </div>
                <div className="pt-2">
                  <Button type="submit" variant="secondary" disabled={savingPassword}>
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
