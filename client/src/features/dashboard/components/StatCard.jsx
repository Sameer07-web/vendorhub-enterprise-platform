import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, percentage, label, colorClass }) => {
  const isPositive = trend === 'up';

  return (
    <div className="relative group bg-white border border-surface-200 rounded-2xl p-5 hover:shadow-floating transition-all duration-300 overflow-hidden">
      {/* Subtle Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-surface-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 ring-1 ring-inset ${colorClass.replace('bg-', 'ring-').replace('500', '500/20').replace('600', '600/20')}`}>
            <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
          </div>
          
          {percentage && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {percentage}%
            </div>
          )}
        </div>

        <div>
          <h4 className="text-3xl font-extrabold text-surface-900 tracking-tight">{value}</h4>
          <p className="text-sm font-medium text-surface-600 mt-1">{title}</p>
          {label && <p className="text-xs text-surface-400 mt-1.5">{label}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
