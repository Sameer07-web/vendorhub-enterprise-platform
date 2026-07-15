import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock as LockIcon } from 'lucide-react';
import { resetPassword } from '../../../api/auth.api';

import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculateStrength = (pass) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPasswordStrength(calculateStrength(value));
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-error-500';
    if (passwordStrength < 75) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const res = await resetPassword(token, formData.password);
      if (res.success) {
        toast.success('Password reset successfully');
        navigate('/login');
      }
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 501) {
        toast.error('Password reset is disabled in the public demo environment.');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to reset password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard title="Invalid Reset Link" subtitle="Please request a new password reset">
          <div className="text-center mt-6">
            <AuthButton className="w-full" onClick={() => navigate('/forgot-password')}>
              Request New Link
            </AuthButton>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Set new password" subtitle="Please create a strong password for your account">
        <form className="space-y-5 mt-2" onSubmit={handleSubmit}>
          
          <div className="space-y-2">
            <AuthInput
              icon={LockIcon}
              placeholder="New password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            
            {formData.password && (
              <div className="flex flex-col gap-1.5 animate-fade-in pl-1 pb-1">
                <div className="flex gap-1 h-1 w-full">
                  <div className={`flex-1 rounded-full ${passwordStrength > 0 ? getStrengthColor() : 'bg-[#FFFFFF1A]'} transition-colors duration-150`} />
                  <div className={`flex-1 rounded-full ${passwordStrength >= 50 ? getStrengthColor() : 'bg-[#FFFFFF1A]'} transition-colors duration-150`} />
                  <div className={`flex-1 rounded-full ${passwordStrength >= 75 ? getStrengthColor() : 'bg-[#FFFFFF1A]'} transition-colors duration-150`} />
                  <div className={`flex-1 rounded-full ${passwordStrength === 100 ? getStrengthColor() : 'bg-[#FFFFFF1A]'} transition-colors duration-150`} />
                </div>
                <span className="text-[10px] text-[#A1A1AA] font-medium text-right uppercase tracking-wider">
                  {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : passwordStrength < 100 ? 'Strong' : 'Very Strong'}
                </span>
              </div>
            )}
          </div>

          <AuthInput
            icon={LockIcon}
            placeholder="Confirm new password"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match" : null}
          />

          <div className="pt-2">
            <AuthButton type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              Reset password
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPassword;
