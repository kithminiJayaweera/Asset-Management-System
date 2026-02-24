'use client';

import { Package, DollarSign, TrendingUp, AlertTriangle, Shield, Wrench, Activity, Clock, Target } from 'lucide-react';
import { Asset } from '@/types/shared';
import { useMemo } from 'react';
import { KPICard } from '../dashboard/KPICard';
import { LineChartCard, BarChartCard, PieChartCard } from '../dashboard/ChartCards';

interface DashboardProps {
  assets: Asset[];
}

export function Dashboard({ assets }: DashboardProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period (last 30 days)
    const currentAssets = assets.filter(a => new Date(a.purchaseDate) >= thirtyDaysAgo);
    const previousAssets = assets.filter(a => new Date(a.purchaseDate) >= sixtyDaysAgo && new Date(a.purchaseDate) < thirtyDaysAgo);

    const total = assets.length;
    const active = assets.filter(a => a.status !== 'retired' && a.status !== 'lost' && a.status !== 'disposed').length;
    const maintenance = assets.filter(a => a.status === 'maintenance').length;
    const lost = assets.filter(a => a.status === 'lost').length;
    const retired = assets.filter(a => a.status === 'retired').length;

    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const lostValue = assets.filter(a => a.status === 'lost').reduce((sum, a) => sum + a.value, 0);

    const depreciatedValue = assets.reduce((sum, a) => {
      const years = (now.getTime() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      const depreciation = a.value * (a.depreciationRate / 100) * years;
      return sum + Math.max(0, a.value - depreciation);
    }, 0);

    const maintenanceOverdue = assets.filter(a => {
      if (!a.lastMaintenanceDate) return false;
      const daysSince = (now.getTime() - new Date(a.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 90;
    });

    const warrantyExpiring = assets.filter(a => {
      if (!a.warrantyEndDate) return false;
      const daysUntil = (new Date(a.warrantyEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30;
    });

    const noWarranty = assets.filter(a => !a.warrantyEndDate || new Date(a.warrantyEndDate) < now);

    // REAL TREND CALCULATIONS
    const previousTotalValue = previousAssets.reduce((sum, a) => sum + a.value, 0);
    const currentTotalValue = currentAssets.reduce((sum, a) => sum + a.value, 0);
    const valueTrend = previousTotalValue > 0 ? (((currentTotalValue - previousTotalValue) / previousTotalValue) * 100).toFixed(1) : '0';

    const previousActive = previousAssets.filter(a => a.status !== 'retired' && a.status !== 'lost' && a.status !== 'disposed').length;
    const currentActive = currentAssets.filter(a => a.status !== 'retired' && a.status !== 'lost' && a.status !== 'disposed').length;
    const healthTrend = previousActive > 0 ? (((currentActive - previousActive) / previousActive) * 100).toFixed(1) : '0';

    const previousUtilized = previousAssets.filter(a => a.assignedTo).length;
    const currentUtilized = currentAssets.filter(a => a.assignedTo).length;
    const utilizationTrend = previousUtilized > 0 ? (((currentUtilized - previousUtilized) / previousUtilized) * 100).toFixed(1) : '0';

    const previousRisk = previousAssets.filter(a => a.status === 'lost').reduce((sum, a) => sum + a.value, 0);
    const currentRisk = currentAssets.filter(a => a.status === 'lost').reduce((sum, a) => sum + a.value, 0);
    const riskTrend = previousRisk > 0 ? (((currentRisk - previousRisk) / previousRisk) * 100).toFixed(1) : currentRisk > 0 ? '100' : '0';

    // IMPROVED HEALTH SCORE
    const overdueRatio = maintenanceOverdue.length / Math.max(total, 1);
    const warrantyRiskRatio = noWarranty.length / Math.max(total, 1);
    const lostRatio = lost / Math.max(total, 1);

    const healthScore = total > 0 ? (
      (active / total) * 35 +
      (1 - overdueRatio) * 25 +
      (1 - lostRatio) * 25 +
      (1 - warrantyRiskRatio) * 15
    ).toFixed(1) : '0';

    // IMPROVED FINANCIAL RISK
    const financialRisk = 
      lostValue +
      maintenanceOverdue.reduce((sum, a) => sum + a.value * 0.3, 0) +
      noWarranty.reduce((sum, a) => sum + a.value * 0.15, 0);

    const utilizationRate = total > 0 ? ((assets.filter(a => a.assignedTo).length / total) * 100).toFixed(1) : '0';

    const categories = assets.reduce((acc, a) => {
      const cat = a.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = { count: 0, value: 0 };
      acc[cat].count++;
      acc[cat].value += a.value;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const statusData = [
      { name: 'Active', value: active },
      { name: 'Maintenance', value: maintenance },
      { name: 'Retired', value: retired },
      { name: 'Lost', value: lost }
    ].filter(s => s.value > 0);

    const categoryData = Object.entries(categories)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 6)
      .map(([name, data]) => ({ name, value: data.count }));

    const valueData = Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthAssets = assets.filter(a => new Date(a.purchaseDate) <= monthDate);
      const value = monthAssets.reduce((sum, a) => {
        const years = (monthDate.getTime() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
        const depreciation = a.value * (a.depreciationRate / 100) * years;
        return sum + Math.max(0, a.value - depreciation);
      }, 0);
      return {
        name: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(value / 1000)
      };
    });

    const riskyAssets = assets
      .filter(a => a.status === 'maintenance' || !a.warrantyEndDate || maintenanceOverdue.some(m => m.id === a.id))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      total, active, maintenance, lost, retired, totalValue, depreciatedValue, lostValue,
      healthScore, financialRisk, utilizationRate, maintenanceOverdue, warrantyExpiring,
      statusData, categoryData, valueData, riskyAssets,
      valueTrend, healthTrend, utilizationTrend, riskTrend
    };
  }, [assets]);


  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#F3E6EC' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#3F303D]">Asset Analytics Dashboard</h1>
          <p className="text-[#3F303D] mt-1">Real-time insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Asset Health Score"
          value={`${analytics.healthScore}/100`}
          icon={Target}
          color={parseFloat(analytics.healthScore) >= 80 ? 'emerald' : parseFloat(analytics.healthScore) >= 60 ? 'amber' : 'red'}
          trend={{ value: `${analytics.healthTrend}%`, direction: Number(analytics.healthTrend) >= 0 ? 'up' : 'down' }}
          subtitle={`${analytics.active} active assets`}
        />
        <KPICard
          title="Total Asset Value"
          value={`₨${(analytics.totalValue / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          color="blue"
          trend={{ value: `${analytics.valueTrend}%`, direction: Number(analytics.valueTrend) >= 0 ? 'up' : 'down' }}
          subtitle={`₨${(analytics.depreciatedValue / 1000000).toFixed(2)}M current value`}
        />
        <KPICard
          title="Financial Risk"
          value={`₨${(analytics.financialRisk / 1000).toFixed(0)}K`}
          icon={AlertTriangle}
          color={analytics.financialRisk > 100000 ? 'red' : 'amber'}
          trend={{ value: `${analytics.riskTrend}%`, direction: Number(analytics.riskTrend) >= 0 ? 'up' : 'down' }}
          subtitle="Lost + maintenance + no warranty"
        />
        <KPICard
          title="Utilization Rate"
          value={`${analytics.utilizationRate}%`}
          icon={TrendingUp}
          color="purple"
          trend={{ value: `${analytics.utilizationTrend}%`, direction: Number(analytics.utilizationTrend) >= 0 ? 'up' : 'down' }}
          subtitle={`${analytics.total - Math.round(parseFloat(analytics.utilizationRate) * analytics.total / 100)} available`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartCard title="Asset Value Trend (6 Months)" data={analytics.valueData} dataKey="value" color="#3b82f6" />
        <BarChartCard title="Assets by Category" data={analytics.categoryData} dataKey="value" color="#10b981" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PieChartCard title="Status Distribution" data={analytics.statusData} colors={['#10b981', '#f59e0b', '#6b7280', '#ef4444']} />

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">Top Risk Assets</h3>
          </div>
          <div className="space-y-3">
            {analytics.riskyAssets.map(asset => (
              <div key={asset.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{asset.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{asset.category} • {asset.status}</p>
                  </div>
                  <span className="text-xs font-medium text-amber-700 ml-2">₨{(asset.value / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
              <span className="text-sm font-medium text-gray-700">Active Assets</span>
              <span className="text-lg font-bold text-emerald-700">{analytics.active}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
              <span className="text-sm font-medium text-gray-700">In Maintenance</span>
              <span className="text-lg font-bold text-amber-700">{analytics.maintenance}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Retired</span>
              <span className="text-lg font-bold text-gray-700">{analytics.retired}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <span className="text-sm font-medium text-gray-700">Lost</span>
              <span className="text-lg font-bold text-red-700">{analytics.lost}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
