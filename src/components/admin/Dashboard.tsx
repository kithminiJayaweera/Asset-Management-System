import { Asset } from '../../page';
import { Package, DollarSign, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  assets: Asset[];
}

export function Dashboard({ assets }: DashboardProps) {
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
  const lostAssets = assets.filter(a => a.status === 'lost').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const lostValue = assets.filter(a => a.status === 'lost').reduce((sum, asset) => sum + asset.value, 0);

  const categories = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      title: 'Total Assets',
      value: totalAssets,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Assets',
      value: activeAssets,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'In Maintenance',
      value: maintenanceAssets,
      icon: AlertCircle,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Value',
      value: `₨${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your asset management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
            <p className="text-2xl text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Assets by Category</h3>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{category}</span>
                  <span className="text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(count / totalAssets) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-700">Active</span>
              </div>
              <span className="text-gray-900">{activeAssets}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-gray-700">Maintenance</span>
              </div>
              <span className="text-gray-900">{maintenanceAssets}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
                <span className="text-gray-700">Retired</span>
              </div>
              <span className="text-gray-900">
                {assets.filter(a => a.status === 'retired').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-gray-700">Lost</span>
              </div>
              <span className="text-gray-900">{lostAssets}</span>
            </div>
          </div>
        </div>
      </div>

      {lostAssets > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-red-900 mb-2">Lost Assets Alert</h3>
              <p className="text-red-700 mb-4">
                There are <strong>{lostAssets} assets</strong> marked as lost with a total value of <strong>Rs. {lostValue.toLocaleString()}</strong>
              </p>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h4 className="text-sm text-gray-900 mb-3">Lost Items:</h4>
                <div className="space-y-2">
                  {assets.filter(a => a.status === 'lost').map(asset => (
                    <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm text-gray-900">{asset.name}</p>
                        <p className="text-xs text-gray-600">{asset.category}</p>
                      </div>
                      <p className="text-sm text-red-600">Rs. {asset.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}