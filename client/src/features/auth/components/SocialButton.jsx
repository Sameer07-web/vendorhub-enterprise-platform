import React from 'react';

const SocialButton = ({ icon: Icon, label, iconColor, onClick }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex-1 flex items-center justify-center gap-2 h-[52px] bg-[#FFFFFF05] border border-[#FFFFFF1A] rounded-[12px] hover:bg-[#FFFFFF0A] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF33] hover:-translate-y-0.5 active:translate-y-0"
    >
      {Icon && <Icon size={18} color={iconColor} />}
      <span className="text-[#FFFFFF] text-[13px] font-[500] whitespace-nowrap">{label}</span>
    </button>
  );
};

export default SocialButton;
