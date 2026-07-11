import React from 'react';

const Loader = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
        </div>
      ))}
    </div>
  );
};

export default Loader;
