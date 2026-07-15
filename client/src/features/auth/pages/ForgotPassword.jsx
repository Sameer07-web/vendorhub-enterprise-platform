import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../../../api/auth.api';

import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Reset link sent');
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 501) {
        toast.error('Password reset is disabled in the public demo environment.');
      } else {
        toast.error(err?.response?.data?.message || 'Failed to send reset link');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <AuthCard title="Check your email" subtitle="We've sent a password reset link">
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
            <div className="w-20 h-20 bg-[#FFFFFF0A] border border-white/10 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-[#3B82F6]" strokeWidth={1.5} />
            </div>
            <p className="text-[#A1A1AA] mb-8 text-[15px]">
              We've sent an email to <span className="font-semibold text-white">{email}</span> with instructions to reset your password.
            </p>
            <AuthButton className="w-full" onClick={() => navigate('/login')}>
              Return to sign in
            </AuthButton>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Reset your password" subtitle="Enter your email to receive reset instructions">
        <form className="space-y-5 mt-2" onSubmit={handleSubmit}>
          
          <AuthInput
            icon={Mail}
            placeholder="Email address"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="pt-2">
            <AuthButton type="submit" showArrow disabled={isSubmitting} isLoading={isSubmitting}>
              Send reset instructions
            </AuthButton>
          </div>
        </form>

        <div className="mt-6">
          <Link to="/login" className="block w-full">
            <AuthButton type="button" variant="secondary" className="w-full">
              Back to sign in
            </AuthButton>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
