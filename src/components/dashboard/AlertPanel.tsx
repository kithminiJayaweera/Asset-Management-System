'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle, LucideIcon } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

interface AlertPanelProps {
  alerts: Alert[];
}

const alertConfig: Record<Alert['type'], { icon: LucideIcon; bg: string; border: string; text: string }> = {
  critical: { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900' },
  warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900' },
  info: { icon: Info, bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-blue-900' },
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900' }
};

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <div key={alert.id} className={`${config.bg} border-2 ${config.border} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${config.text} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${config.text} text-sm mb-1`}>{alert.title}</h4>
                <p className="text-sm text-gray-700">{alert.message}</p>
              </div>
              {alert.action && (
                <button
                  onClick={alert.action.onClick}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  {alert.action.label}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
