'use client';

import { Download, FileText, FileSpreadsheet, FileDown, TrendingDown, Building2, Package, DollarSign, Target } from 'lucide-react';
import { Asset, Organization } from '@/types/shared';
import { useState, useMemo } from 'react';
import { FilterBar, FilterState } from '../dashboard/FilterBar';
import { BarChartCard } from '../dashboard/ChartCards';

interface ReportsProps {
  assets: Asset[];
  organizations: Organization[];
}

export function Reports({ assets, organizations }: ReportsProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    organizationId: '',
    category: '',
    status: ''
  });

  const [exportOpen, setExportOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (filters.dateRange.start && new Date(asset.purchaseDate) < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange.end && new Date(asset.purchaseDate) > new Date(filters.dateRange.end)) return false;
      if (filters.organizationId && asset.organizationId !== filters.organizationId) return false;
      if (filters.category && asset.category !== filters.category) return false;
      if (filters.status && asset.status !== filters.status) return false;
      return true;
    });
  }, [assets, filters]);

  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const total = filteredAssets.length;
    const active = filteredAssets.filter(a => a.status === 'active').length;
    const maintenance = filteredAssets.filter(a => a.status === 'maintenance').length;
    const retired = filteredAssets.filter(a => a.status === 'retired').length;
    const lost = filteredAssets.filter(a => a.status === 'lost').length;

    const totalValue = filteredAssets.reduce((sum, a) => sum + a.value, 0);
    const lostValue = filteredAssets.filter(a => a.status === 'lost').reduce((sum, a) => sum + a.value, 0);

    const depreciatedValue = filteredAssets.reduce((sum, a) => {
      const years = (now.getTime() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      const depreciation = a.value * (a.depreciationRate / 100) * years;
      return sum + Math.max(0, a.value - depreciation);
    }, 0);

    const depreciationLoss = totalValue - depreciatedValue;
    const depreciationPct = totalValue > 0 ? ((depreciationLoss / totalValue) * 100).toFixed(1) : '0';

    const maintenanceCost = filteredAssets.filter(a => a.status === 'maintenance').reduce((sum, a) => sum + a.value * 0.1, 0);
    const totalFinancialImpact = depreciationLoss + lostValue + maintenanceCost;

    // Previous period comparison
    const currentAssets = filteredAssets.filter(a => new Date(a.purchaseDate) >= thirtyDaysAgo);
    const previousAssets = filteredAssets.filter(a => new Date(a.purchaseDate) >= sixtyDaysAgo && new Date(a.purchaseDate) < thirtyDaysAgo);
    
    const previousValue = previousAssets.reduce((s, a) => s + a.value, 0);
    const currentValue = currentAssets.reduce((s, a) => s + a.value, 0);
    const valueChangeTrend = previousValue > 0 ? (((currentValue - previousValue) / previousValue) * 100).toFixed(1) : '0';

    const utilizationRate = total > 0 ? ((filteredAssets.filter(a => a.assignedTo).length / total) * 100).toFixed(1) : '0';

    const avgAge = filteredAssets.length > 0 ? filteredAssets.reduce((sum, a) => {
      const years = (now.getTime() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return sum + years;
    }, 0) / filteredAssets.length : 0;

    const categories = filteredAssets.reduce((acc, a) => {
      const cat = a.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = 0;
      acc[cat]++;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    const maxAge = filteredAssets.length > 0 ? Math.max(...filteredAssets.map(a => (now.getTime() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365))) : 1;

    const orgPerformance = organizations.map(org => {
      const orgAssets = filteredAssets.filter(a => a.organizationId === org.id);
      const orgTotal = orgAssets.length;
      const orgValue = orgAssets.reduce((sum, a) => sum + a.value, 0);
      const orgLost = orgAssets.filter(a => a.status === 'lost').length;
      const orgUtilization = orgTotal > 0 ? ((orgAssets.filter(a => a.assignedTo).length / orgTotal) * 100).toFixed(1) : '0';
      const orgAvgAge = orgTotal > 0 ? orgAssets.reduce((sum, a) => {
        const years = (now.getTime() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
        return sum + years;
      }, 0) / orgTotal : 0;

      const lostRatio = orgTotal > 0 ? orgLost / orgTotal : 0;
      const ageRatio = maxAge > 0 ? orgAvgAge / maxAge : 0;
      const score = (parseFloat(orgUtilization) / 100) * 0.4 + (1 - lostRatio) * 0.3 + (1 - ageRatio) * 0.3;

      return {
        id: org.id,
        name: org.name,
        assetCount: orgTotal,
        totalValue: orgValue,
        lostAssets: orgLost,
        utilization: orgUtilization,
        avgAge: orgAvgAge.toFixed(1),
        score: (score * 100).toFixed(1)
      };
    }).filter(org => org.assetCount > 0).sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

    return {
      total, active, maintenance, retired, lost, totalValue, depreciatedValue,
      depreciationLoss, depreciationPct, maintenanceCost, lostValue, avgAge, categoryData, orgPerformance,
      valueChangeTrend, utilizationRate, totalFinancialImpact
    };
  }, [filteredAssets, organizations]);

  const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
    const date = new Date().toISOString().split('T')[0];

    if (type === 'csv') {
      const rows = filteredAssets.map(a => [
        a.name,
        a.category || 'N/A',
        a.status,
        a.value,
        a.purchaseDate,
        a.location,
        a.assignedTo || 'Unassigned'
      ]);

      const csv = 'Name,Category,Status,Value,Purchase Date,Location,Assigned To\n' + rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `asset-report-${date}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (type === 'pdf') {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Asset Management Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      
      // Executive Summary
      doc.setFontSize(14);
      doc.text('Executive Summary', 14, 40);
      doc.setFontSize(10);
      doc.text(`Total Assets: ${analytics.total}`, 14, 48);
      doc.text(`Total Value: Rs.${analytics.totalValue.toLocaleString()}`, 14, 54);
      doc.text(`Depreciation: ${analytics.depreciationPct}% (Rs.${analytics.depreciationLoss.toLocaleString()})`, 14, 60);
      doc.text(`Utilization Rate: ${analytics.utilizationRate}%`, 14, 66);
      doc.text(`Financial Impact: Rs.${analytics.totalFinancialImpact.toLocaleString()}`, 14, 72);
      
      // Asset Status
      autoTable(doc, {
        startY: 80,
        head: [['Status', 'Count', 'Percentage']],
        body: [
          ['Active', analytics.active.toString(), `${analytics.total > 0 ? ((analytics.active / analytics.total) * 100).toFixed(1) : 0}%`],
          ['Maintenance', analytics.maintenance.toString(), `${analytics.total > 0 ? ((analytics.maintenance / analytics.total) * 100).toFixed(1) : 0}%`],
          ['Retired', analytics.retired.toString(), `${analytics.total > 0 ? ((analytics.retired / analytics.total) * 100).toFixed(1) : 0}%`],
          ['Lost', analytics.lost.toString(), `${analytics.total > 0 ? ((analytics.lost / analytics.total) * 100).toFixed(1) : 0}%`]
        ]
      });
      
      // Organization Performance
      if (analytics.orgPerformance.length > 0) {
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [['Organization', 'Score', 'Assets', 'Value', 'Utilization']],
          body: analytics.orgPerformance.map(org => [
            org.name,
            org.score,
            org.assetCount.toString(),
            `Rs.${(org.totalValue / 1000).toFixed(0)}K`,
            `${org.utilization}%`
          ])
        });
      }
      
      doc.save(`asset-report-${date}.pdf`);
    } else if (type === 'excel') {
      const XLSX = await import('xlsx');
      
      // Summary Sheet
      const summaryData = [
        ['Asset Management Report'],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [],
        ['Executive Summary'],
        ['Total Assets', analytics.total],
        ['Active Assets', analytics.active],
        ['Maintenance', analytics.maintenance],
        ['Retired', analytics.retired],
        ['Lost', analytics.lost],
        [],
        ['Financial Summary'],
        ['Total Value', analytics.totalValue],
        ['Current Value', analytics.depreciatedValue],
        ['Depreciation Loss', analytics.depreciationLoss],
        ['Depreciation %', `${analytics.depreciationPct}%`],
        ['Lost Value', analytics.lostValue],
        ['Maintenance Cost', analytics.maintenanceCost],
        ['Total Financial Impact', analytics.totalFinancialImpact],
        [],
        ['Utilization Rate', `${analytics.utilizationRate}%`],
        ['Value Change Trend', `${analytics.valueChangeTrend}%`]
      ];
      
      // Assets Sheet
      const assetsData = [
        ['Name', 'Category', 'Status', 'Value', 'Purchase Date', 'Location', 'Assigned To'],
        ...filteredAssets.map(a => [
          a.name,
          a.category || 'N/A',
          a.status,
          a.value,
          a.purchaseDate,
          a.location,
          a.assignedTo || 'Unassigned'
        ])
      ];
      
      // Organization Performance Sheet
      const orgData = [
        ['Organization', 'Score', 'Assets', 'Total Value', 'Utilization', 'Avg Age', 'Lost'],
        ...analytics.orgPerformance.map(org => [
          org.name,
          org.score,
          org.assetCount,
          org.totalValue,
          `${org.utilization}%`,
          `${org.avgAge}y`,
          org.lostAssets
        ])
      ];
      
      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      const wsAssets = XLSX.utils.aoa_to_sheet(assetsData);
      const wsOrgs = XLSX.utils.aoa_to_sheet(orgData);
      
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
      XLSX.utils.book_append_sheet(wb, wsAssets, 'Assets');
      XLSX.utils.book_append_sheet(wb, wsOrgs, 'Organizations');
      
      XLSX.writeFile(wb, `asset-report-${date}.xlsx`);
    }
    setExportOpen(false);
  };

  const allCategories = Array.from(new Set(assets.map(a => a.category).filter(Boolean))) as string[];

  const statusColors = {
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    gray: 'bg-gray-600',
    red: 'bg-red-600'
  };

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: '#EFEFEF' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial and operational insights</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          {exportOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Executive PDF</p>
                  <p className="text-xs text-gray-500">Summary report</p>
                </div>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Excel Financial</p>
                  <p className="text-xs text-gray-500">Detailed analysis</p>
                </div>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
              >
                <FileDown className="w-4 h-4 text-red-700" />
                <div>
                  <p className="font-medium text-gray-900">CSV Raw Data</p>
                  <p className="text-xs text-gray-500">All asset records</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <FilterBar
        onFilterChange={setFilters}
        organizations={organizations}
        categories={allCategories}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Financial Impact</p>
              <p className="text-2xl font-bold text-gray-900">₨{(analytics.totalFinancialImpact / 1000000).toFixed(2)}M</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Loss + Depreciation + Maintenance
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Depreciation %</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.depreciationPct}%</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            ₨{(analytics.depreciationLoss / 1000000).toFixed(2)}M total loss
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Target className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Utilization Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.utilizationRate}%</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {analytics.active} active • {analytics.maintenance} maintenance
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Asset Value Trend</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.valueChangeTrend}%</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last 30 days vs previous period
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Original Asset Value</span>
              <span className="text-sm font-semibold text-gray-900">₨{analytics.totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Current Asset Value</span>
              <span className="text-sm font-semibold text-emerald-700">₨{analytics.depreciatedValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Depreciation Loss</span>
              <span className="text-sm font-semibold text-red-700">-₨{analytics.depreciationLoss.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Lost Asset Value</span>
              <span className="text-sm font-semibold text-red-700">₨{analytics.lostValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Maintenance Impact</span>
              <span className="text-sm font-semibold text-amber-700">₨{analytics.maintenanceCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Total Financial Impact</span>
              <span className="text-sm font-semibold text-red-700">-₨{analytics.totalFinancialImpact.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Active Assets</span>
              <span className="text-sm font-semibold text-gray-900">{analytics.active} ({analytics.total > 0 ? ((analytics.active / analytics.total) * 100).toFixed(1) : '0'}%)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">In Maintenance</span>
              <span className="text-sm font-semibold text-gray-900">{analytics.maintenance} ({analytics.total > 0 ? ((analytics.maintenance / analytics.total) * 100).toFixed(1) : '0'}%)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Lost/Retired</span>
              <span className="text-sm font-semibold text-gray-900">{analytics.lost + analytics.retired} ({analytics.total > 0 ? (((analytics.lost + analytics.retired) / analytics.total) * 100).toFixed(1) : '0'}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard title="Assets by Category" data={analytics.categoryData} dataKey="value" color="#AE040F" />

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Status Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'Active', count: analytics.active, color: 'emerald' as const },
              { label: 'Maintenance', count: analytics.maintenance, color: 'amber' as const },
              { label: 'Retired', count: analytics.retired, color: 'gray' as const },
              { label: 'Lost', count: analytics.lost, color: 'red' as const }
            ].map(status => {
              const pct = analytics.total > 0 ? ((status.count / analytics.total) * 100).toFixed(1) : '0';
              return (
                <div key={status.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{status.label}</span>
                    <span className="text-sm text-gray-900">{status.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${statusColors[status.color]} h-2 rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Organization Performance Scorecards</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Organization</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Score</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Assets</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total Value</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Utilization</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Avg Age</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Lost</th>
              </tr>
            </thead>
            <tbody>
              {analytics.orgPerformance.map(org => (
                <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{org.name}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      parseFloat(org.score) >= 80 ? 'bg-emerald-100 text-emerald-700' :
                      parseFloat(org.score) >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {org.score}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">{org.assetCount}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">₨{(org.totalValue / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      parseFloat(org.utilization) >= 80 ? 'bg-emerald-100 text-emerald-700' :
                      parseFloat(org.utilization) >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {org.utilization}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">{org.avgAge}y</td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={`font-semibold ${org.lostAssets > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                      {org.lostAssets}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
