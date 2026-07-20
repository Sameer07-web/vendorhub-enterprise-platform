import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const DepartmentSpendChart = ({ data }) => {
  const formatYAxis = (tickItem) => {
    if (tickItem >= 1000000) return `$${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `$${(tickItem / 1000).toFixed(1)}K`;
    return `$${tickItem}`;
  };

  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F4F5' }} />
          <Bar dataKey="spend" radius={[4, 4, 0, 0]} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentSpendChart;
