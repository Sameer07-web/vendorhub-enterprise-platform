import React from 'react';

const Divider = ({ text = "or continue with" }) => {
  return (
    <div className="relative flex items-center py-6">
      <div className="flex-grow border-t border-[#FFFFFF1A]" />
      <span className="flex-shrink-0 mx-4 text-[13px] text-[#A1A1AA] font-[400]">{text}</span>
      <div className="flex-grow border-t border-[#FFFFFF1A]" />
    </div>
  );
};

export default Divider;
