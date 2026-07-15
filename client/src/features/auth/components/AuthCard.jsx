import React from "react";

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="relative w-[560px] h-[860px] rounded-[36px] border border-white/20 bg-white/[0.08] backdrop-blur-[45px] shadow-[0_40px_120px_rgba(0,0,0,0.45)] overflow-hidden px-10 pt-10 pb-8">

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent blur-[50px]" />

      <div className="relative z-10 flex flex-col items-center">

        <div className="h-20 w-20 rounded-full border border-white/10 bg-[#101528]/80 backdrop-blur-xl flex items-center justify-center mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
          <span className="text-[42px] font-black bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
            V
          </span>
        </div>

        <h2 className="text-[52px] font-extrabold tracking-[-0.04em] leading-none text-white text-center">
          {title}
        </h2>

        <p className="mt-5 text-[20px] text-[#C9CDD6] text-center">
          {subtitle}
        </p>

      </div>

      <div className="relative z-10 mt-10">
        {children}
      </div>

    </div>
  );
};

export default AuthCard;