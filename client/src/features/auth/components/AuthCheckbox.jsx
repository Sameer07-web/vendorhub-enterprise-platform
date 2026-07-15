import React from 'react';

const AuthCheckbox = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className="h-[18px] w-[18px] rounded-[4px] border border-[#FFFFFF33] bg-[#FFFFFF05] text-[#3B82F6] focus:ring-[#3B82F6]/50 focus:ring-offset-[#03050C] transition-colors duration-150 cursor-pointer"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="ml-2 block text-[13px] text-[#A1A1AA] cursor-pointer hover:text-[#FFFFFF] transition-colors duration-150">
          {label}
        </label>
      )}
    </div>
  );
};

export default AuthCheckbox;
