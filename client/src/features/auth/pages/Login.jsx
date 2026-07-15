import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock as LockIcon, Shield } from 'lucide-react';
import { login } from '../../../api/auth.api';

import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import AuthCheckbox from '../components/AuthCheckbox';
import Divider from '../components/Divider';
import SocialButton from '../components/SocialButton';

// Simple inline SVG components for Brand Icons
const GoogleIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const MicrosoftIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

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

  const handleDemoLogin = async () => {
    const email = import.meta.env.VITE_DEMO_EMAIL || 'demo@vendorhub.app';
    const password = import.meta.env.VITE_DEMO_PASSWORD || 'demo123';
    setFormData({ email, password });

    try {
      setIsSubmitting(true);
      const res = await login({ email, password });
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Demo login successful');
        navigate('/app');
      }
    } catch {
      toast.error('Demo environment unavailable or invalid credentials');
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

        <Divider text="or continue with" />

        <div className="mt-6 flex gap-4 w-full">
          <SocialButton icon={GoogleIcon} label="Google" onClick={handleDemoLogin} />
          <SocialButton icon={MicrosoftIcon} label="Microsoft" onClick={handleDemoLogin} />
          <SocialButton icon={Shield} label="SSO / SAML" onClick={handleDemoLogin} />
        </div>

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
