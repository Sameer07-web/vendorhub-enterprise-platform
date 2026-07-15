import React from 'react';
import { ShieldCheck, Cloud, Lock, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImg from '../../../assets/hero.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen w-full flex bg-[#03050C] font-sans selection:bg-[#3B82F6]/30 selection:text-white relative overflow-hidden">

      {/* Background ambient glows and blurred office */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.12] mix-blend-overlay pointer-events-none filter blur-md" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop)' }} />
      <div className="absolute top-[20%] left-[-5%] w-[45%] h-[50%] rounded-full bg-[#2563EB]/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[45%] h-[50%] rounded-full bg-[#7C3AED]/15 blur-[160px] pointer-events-none" />
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#03050C_110%)] pointer-events-none" />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-1.5 p-1 rounded-[16px] bg-[#111827]/40 border border-[#FFFFFF1A] backdrop-blur-md">
        <button className="p-1.5 rounded-full text-[#A1A1AA] hover:text-white transition-colors"><Sun size={16} /></button>
        <button className="p-1.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"><Moon size={16} /></button>
        <span className="text-[13px] font-[500] text-white pr-3 pl-1">System</span>
      </div>

      {/* Left Column: Marketing Panel (52%) */}
      <div className="hidden lg:flex flex-col justify-between py-10 px-14 xl:px-20 relative z-10 w-[50%]">

        <div>
          <Link to="/" className="flex items-center gap-3 group w-fit focus:outline-none focus:ring-2 focus:ring-[#FFFFFF33] rounded-md">
            <div className="h-10 w-10 bg-[#2563EB] rounded-[10px] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#7C3AED]" />
              <span className="text-[22px] font-[800] text-white leading-none relative z-10">V</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[24px] font-[800] text-white tracking-tight leading-none mb-1">VendorHub</span>
              <span className="text-[11px] font-[400] text-[#A1A1AA] tracking-wide leading-none">Enterprise Procurement Platform</span>
            </div>
          </Link>

          <div className="mt-16 max-w-[480px]">
            <h1 className="text-[60px] font-[800] text-white tracking-tight leading-[1.08] mb-8">
              Smarter Procurement.<br />
              Stronger <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">Partnerships.</span>
            </h1>
            <p className="mt-6 max-w-[430px] text-[16px] leading-7 font-normal text-[#A1A1AA]">
              Streamline procurement, manage vendors, and automate purchasing workflows with a secure enterprise platform built for modern organizations.
            </p>
          </div>
        </div>

        {/* Floating Illustration Area */}
        <div className="relative w-full max-w-md mt-4 mb-2 flex items-center justify-center">
          <img src={heroImg} alt="Procurement Illustration" className="w-full h-auto object-contain max-h-[270px] filter drop-shadow-[0_18px_36px_rgba(37,99,235,0.15)]" />
        </div>

        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[#FFFFFF1A] flex-1" />
            <span className="text-[#A1A1AA] text-[11px] font-[500]">Trusted by forward-thinking organizations</span>
            <div className="h-px bg-[#FFFFFF1A] flex-1" />
          </div>

          <div className="flex justify-between items-center max-w-[400px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-[#3B82F6]/30 flex items-center justify-center bg-[#3B82F6]/10">
                <ShieldCheck className="text-[#3B82F6] w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[13px] font-[600] leading-tight">Secure</span>
                <span className="text-[#A1A1AA] text-[11px] font-[400]">by Design</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-[#3B82F6]/30 flex items-center justify-center bg-[#3B82F6]/10">
                <Lock className="text-[#3B82F6] w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[13px] font-[600] leading-tight">Enterprise</span>
                <span className="text-[#A1A1AA] text-[11px] font-[400]">Grade</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-[#3B82F6]/30 flex items-center justify-center bg-[#3B82F6]/10">
                <Cloud className="text-[#3B82F6] w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-[13px] font-[600] leading-tight">99.9%</span>
                <span className="text-[#A1A1AA] text-[11px] font-[400]">Uptime</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[12px] text-[#A1A1AA] font-[400] opacity-60">© 2026 VendorHub. All rights reserved.</p>
          </div>
        </div>

      </div>

      {/* Right Column: Auth Form Area (48%) */}
      <div className="flex flex-col justify-center py-8 px-6 lg:px-12 xl:px-20 relative z-10 w-full lg:w-[50%]">
        <div className="mx-auto w-full max-w-[440px]">
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
