import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock as LockIcon } from 'lucide-react';
import { login } from '../../../api/auth.api';

import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import AuthCheckbox from '../components/AuthCheckbox';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await login(formData);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Login successful');
        navigate('/app');
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Welcome back" subtitle="Sign in to your VendorHub account">
        <form className="space-y-5 mt-2" onSubmit={handleSubmit}>

          <AuthInput
            icon={Mail}
            placeholder="Email address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <AuthInput
            icon={LockIcon}
            placeholder="Password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <div className="flex items-center justify-between pt-1 pb-2">
            <AuthCheckbox label="Remember me" id="remember" />
            <Link to="/forgot-password" className="text-[13px] font-[500] text-[#8B5CF6] hover:text-[#3B82F6] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 rounded">
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" showArrow disabled={isSubmitting} isLoading={isSubmitting}>
            Sign In
          </AuthButton>

        </form>

        <div className="mt-6">
          <Link to="/register" className="block w-full">
            <AuthButton type="button" variant="secondary" className="w-full">
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                Create new account
              </span>
            </AuthButton>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[#A1A1AA] opacity-80">
          <LockIcon size={14} />
          <span className="text-[13px] font-[400]">Your data is secure with enterprise-grade encryption.</span>
        </div>

      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
