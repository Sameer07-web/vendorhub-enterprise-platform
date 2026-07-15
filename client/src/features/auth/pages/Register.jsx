import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock as LockIcon, Shield, User } from 'lucide-react';
import { register } from '../../../api/auth.api';

import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import Divider from '../components/Divider';
import SocialButton from '../components/SocialButton';

const GoogleIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
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
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const payload = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password
      };
      
      const res = await register(payload);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Account created successfully');
        navigate('/app');
      }
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 501) {
        toast.error('Registration is disabled in the public demo environment.');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to create account');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = () => toast.error('Demo environment unavailable');

  return (
    <AuthLayout>
      <AuthCard title="Create your account" subtitle="Sign up for VendorHub">
        <form className="space-y-5 mt-2" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              icon={User}
              placeholder="First name"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
            />
            <AuthInput
              icon={User}
              placeholder="Last name"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <AuthInput
            icon={Mail}
            placeholder="Work email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <div className="space-y-2">
            <AuthInput
              icon={LockIcon}
              placeholder="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            
            {/* Password Strength Indicator */}
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
            placeholder="Confirm password"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match" : null}
          />

          <div className="pt-2">
            <AuthButton type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              Create Account
            </AuthButton>
          </div>
        </form>

        <Divider text="or continue with" />

        <div className="mt-6 flex gap-4 w-full">
          <SocialButton icon={GoogleIcon} label="Google" onClick={handleDemo} />
          <SocialButton icon={MicrosoftIcon} label="Microsoft" onClick={handleDemo} />
          <SocialButton icon={Shield} label="SSO / SAML" onClick={handleDemo} />
        </div>

        <div className="mt-6">
          <Link to="/login" className="block w-full">
            <AuthButton type="button" variant="secondary" className="w-full">
              Already have an account? Sign In
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

export default Register;
