import React from 'react';
import { Card, CardHeader } from '../../../components/common/Card';
import { CheckCircle, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

const ActivityTimeline = ({ data = [] }) => {
  const getIconConfig = (type) => {
    switch (type) {
      case 'award': return { icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-100' };
      case 'request': return { icon: FileText, color: 'text-primary-600', bg: 'bg-primary-100' };
      case 'warning': return { icon: AlertTriangle, color: 'text-warning-600', bg: 'bg-warning-100' };
      case 'success': return { icon: ShieldCheck, color: 'text-success-600', bg: 'bg-success-100' };
      default: return { icon: FileText, color: 'text-surface-600', bg: 'bg-surface-100' };
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader title="Recent Activity" />
      <div className="px-6 pb-6">
        <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-surface-100">
          {data.map((item) => {
            const { icon: Icon, color, bg } = getIconConfig(item.type);
            return (
              <div key={item.id} className="relative flex gap-4">
                <div className={`w-6 h-6 rounded-full ${bg} ${color} flex items-center justify-center shrink-0 ring-4 ring-white z-10`}>
                  <Icon size={12} strokeWidth={2.5} />
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-semibold text-surface-900 leading-tight">{item.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-surface-500">{item.description}</p>
                    <span className="text-[10px] font-medium text-surface-400 uppercase tracking-wider">{item.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ActivityTimeline;
