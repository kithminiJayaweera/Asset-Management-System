import { Package, DollarSign, AlertCircle, TrendingUp, AlertTriangle, Activity, Archive, Wrench } from 'lucide-react';
import { Asset } from '@/types/shared';

interface DashboardProps {
  assets: Asset[];
}

export function Dashboard({ assets }: DashboardProps) {
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
  const lostAssets = assets.filter(a => a.status === 'lost').length;
  const retiredAssets = assets.filter(a => a.status === 'retired').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const lostValue = assets.filter(a => a.status === 'lost').reduce((sum, asset) => sum + asset.value, 0);
  const activePercentage = totalAssets > 0 ? ((activeAssets / totalAssets) * 100).toFixed(1) : '0';

  const categories = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      title: 'Total Assets',
      value: totalAssets,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Assets',
      value: activeAssets,
      icon: Activity,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      change: `${activePercentage}%`,
      changeType: 'neutral'
    },
    {
      title: 'In Maintenance',
      value: maintenanceAssets,
      icon: Wrench,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      iconBg: 'bg-amber-500',
      change: maintenanceAssets > 0 ? 'Attention' : 'Good',
      changeType: maintenanceAssets > 0 ? 'warning' : 'increase'
    },
    {
      title: 'Total Value',
      value: `₨${totalValue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      change: '+8.2%',
      changeType: 'increase'
    }
  ];

  const categoryColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Dashboard</h2>
        <p className="text-gray-800">Welcome Back! Here's what had been happening with your assets.</p>
      </div>

      {/* Stats Grid with Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.changeType === 'increase' ? 'bg-green-100 text-green-700' :
                  stat.changeType === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1 font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-black group-hover:text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets by Category - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">Assets by Category</h3>
            <span className="text-sm text-gray-700">{Object.keys(categories).length} Categories</span>
          </div>
          <div className="space-y-5">
            {Object.entries(categories).map(([category, count], index) => {
              const percentage = ((count / totalAssets) * 100).toFixed(1);
              return (
                <div key={category} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${categoryColors[index % categoryColors.length]}`} />
                      <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">{category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700">{percentage}%</span>
                      <span className="text-black font-semibold">{count}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`${categoryColors[index % categoryColors.length]} h-3 rounded-full transition-all duration-500 ease-out shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-black mb-6">Status Overview</h3>
          <div className="space-y-3">
            <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-gray-800 font-medium">Active</span>
                </div>
                <span className="text-lg font-bold text-emerald-700">{activeAssets}</span>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-gray-800 font-medium">Maintenance</span>
                </div>
                <span className="text-lg font-bold text-amber-700">{maintenanceAssets}</span>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  <span className="text-gray-800 font-medium">Retired</span>
                </div>
                <span className="text-lg font-bold text-gray-700">{retiredAssets}</span>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-gray-800 font-medium">Lost</span>
                </div>
                <span className="text-lg font-bold text-red-700">{lostAssets}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lost Assets Alert */}
      {lostAssets > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-2">⚠️ Lost Assets Alert</h3>
              <p className="text-red-700 mb-4 text-sm leading-relaxed">
                There are <strong className="font-bold">{lostAssets} assets</strong> marked as lost with a total value of <strong className="font-bold">Rs. {lostValue.toLocaleString()}</strong>
              </p>
              <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
                <h4 className="text-sm font-bold text-black mb-4 flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  Lost Items:
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {assets.filter(a => a.status === 'lost').map(asset => (
                    <div key={asset.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-black">{asset.name}</p>
                        <p className="text-xs text-gray-700 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {asset.category}
                          </span>
                        </p>
                      </div>
                      <p className="text-sm font-bold text-red-700">Rs. {asset.value.toLocaleString()}</p>
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






