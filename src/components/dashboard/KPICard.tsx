'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  subtitle?: string;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'indigo';
}

const colorMap = {
  blue: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200' },
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
  red: { bg: 'bg-red-50', icon: 'bg-red-500', text: 'text-red-700', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200' },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-200' }
};

export function KPICard({ title, value, icon: Icon, trend, subtitle, color }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${colors.icon} p-3 rounded-lg shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trend.direction === 'up' ? 'bg-emerald-100 text-emerald-700' :
            trend.direction === 'down' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
