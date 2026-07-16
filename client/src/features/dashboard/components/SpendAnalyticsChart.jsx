import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    return (
      <div className="bg-white border border-surface-200 rounded-lg shadow-floating p-3">
        <p className="text-sm font-medium text-surface-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-primary-600">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const SpendAnalyticsChart = ({ data }) => {
  const formatYAxis = (tickItem) => {
    return `$${(tickItem / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717A', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717A', fontSize: 12 }} 
            tickFormatter={formatYAxis} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#A1A1AA', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="spend" 
            stroke="#3B82F6" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorSpend)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendAnalyticsChart;
