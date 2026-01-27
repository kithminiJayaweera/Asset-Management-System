import { Asset, Organization } from '../../page';
import { BarChart3, TrendingUp, Package, DollarSign, AlertCircle, Download } from 'lucide-react';

interface ReportsProps {
  assets: Asset[];
  organizations: Organization[];
}

export function Reports({ assets, organizations }: ReportsProps) {
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
  const retiredAssets = assets.filter(a => a.status === 'retired').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  const categoryData = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orgData = organizations.map(org => {
    const orgAssets = assets.filter(a => a.organizationId === org.id);
    const orgValue = orgAssets.reduce((sum, a) => sum + a.value, 0);
    return {
      name: org.name,
      count: orgAssets.length,
      value: orgValue
    };
  });

  const activePercentage = totalAssets > 0 ? (activeAssets / totalAssets * 100).toFixed(1) : 0;
  const maintenancePercentage = totalAssets > 0 ? (maintenanceAssets / totalAssets * 100).toFixed(1) : 0;
  const retiredPercentage = totalAssets > 0 ? (retiredAssets / totalAssets * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Reports & Analytics</h2>
          <p className="text-gray-600">View comprehensive reports and statistics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl text-gray-900">{totalAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Assets</p>
              <p className="text-2xl text-gray-900">{activeAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl text-gray-900">{maintenanceAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl text-gray-900">₨{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg text-gray-900 mb-6">Asset Status Distribution</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-700">Active</span>
              <span className="text-sm text-gray-900">{activeAssets} ({activePercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all" 
                style={{ width: `${activePercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-700">Maintenance</span>
              <span className="text-sm text-gray-900">{maintenanceAssets} ({maintenancePercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all" 
                style={{ width: `${maintenancePercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-700">Retired</span>
              <span className="text-sm text-gray-900">{retiredAssets} ({retiredPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-600 h-2 rounded-full transition-all" 
                style={{ width: `${retiredPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-6">Assets by Category</h3>
          <div className="space-y-4">
            {Object.entries(categoryData).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalAssets) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-6">Assets by Organization</h3>
          <div className="space-y-4">
            {orgData.map(org => (
              <div key={org.name} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-900">{org.name}</span>
                  <span className="text-sm text-gray-600">{org.count} assets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Total Value</span>
                  <span className="text-xs text-gray-700">₨{org.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {orgData.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No organizations found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}