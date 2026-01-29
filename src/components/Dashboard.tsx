'use client';

import { Asset } from '../app/page';
import { useState, useEffect } from 'react';
import { 
  Package, 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Zap,
  Calendar,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';

interface DashboardProps {
  assets: Asset[];
}

export function Dashboard({ assets }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animate, setAnimate] = useState(false);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Trigger animation on data change
  useEffect(() => {
    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timeout);
  }, [assets.length]);

  // Calculate metrics
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
  const lostAssets = assets.filter(a => a.status === 'lost').length;
  const retiredAssets = assets.filter(a => a.status === 'retired').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const lostValue = assets.filter(a => a.status === 'lost').reduce((sum, asset) => sum + asset.value, 0);
  const activeValue = assets.filter(a => a.status === 'active').reduce((sum, asset) => sum + asset.value, 0);
  
  // Calculate asset utilization rate
  const utilizationRate = totalAssets > 0 ? ((activeAssets / totalAssets) * 100).toFixed(1) : 0;
  
  // Calculate average asset value
  const avgAssetValue = totalAssets > 0 ? totalValue / totalAssets : 0;
  
  // Get recently added assets (last 5)
  const recentAssets = [...assets]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  // Assets requiring attention (maintenance or old)
  const assetsNeedingAttention = assets.filter(a => 
    a.status === 'maintenance' || 
    (a.lastMaintenanceDate && 
     new Date().getTime() - new Date(a.lastMaintenanceDate).getTime() > 90 * 24 * 60 * 60 * 1000)
  );

  const categories = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get trend (mock - in real app would compare with previous period)
  const assetTrend = 5.2; // Percentage change
  const valueTrend = 12.5;

  const stats = [
    {
      title: 'Total Assets',
      value: totalAssets.toString(),
      icon: Package,
      trend: assetTrend,
      trendUp: true,
      color: 'from-blue-500 to-blue-600',
      description: 'Active inventory',
      metric: `${utilizationRate}% utilized`
    },
    {
      title: 'Total Value',
      value: `₨${(totalValue / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      trend: valueTrend,
      trendUp: true,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Asset worth',
      metric: `Avg ₨${(avgAssetValue / 1000).toFixed(0)}K`
    },
    {
      title: 'Active Assets',
      value: activeAssets.toString(),
      icon: TrendingUp,
      trend: 3.1,
      trendUp: true,
      color: 'from-violet-500 to-violet-600',
      description: 'In operation',
      metric: `₨${(activeValue / 1000000).toFixed(2)}M value`
    },
    {
      title: 'Needs Attention',
      value: assetsNeedingAttention.length.toString(),
      icon: AlertCircle,
      trend: -2.3,
      trendUp: false,
      color: 'from-amber-500 to-amber-600',
      description: 'Maintenance due',
      metric: `${maintenanceAssets} in service`
    }
  ];

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-violet-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Clock */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time asset monitoring and analytics</p>
        </div>
        <Card className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-gray-600">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${animate ? 'scale-105' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">{stat.title}</CardDescription>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(stat.trend)}%
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  {stat.metric}
                </Badge>
              </div>
            </CardContent>
            {/* Animated background effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 hover:opacity-5 transition-opacity`} />
          </Card>
        ))}
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Asset Distribution by Category */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Asset Distribution</CardTitle>
                    <CardDescription>By category</CardDescription>
                  </div>
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count], index) => {
                    const percentage = ((count / totalAssets) * 100).toFixed(1);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(index)}`} />
                            <span className="font-medium text-gray-900">{category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{count} assets</span>
                            <Badge variant="outline" className="text-xs">{percentage}%</Badge>
                          </div>
                        </div>
                        <Progress value={Number(percentage)} className="h-2" />
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Status Overview</CardTitle>
                    <CardDescription>Real-time status distribution</CardDescription>
                  </div>
                  <Activity className="w-5 h-5 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Active</p>
                      <p className="text-xs text-gray-600">Operating normally</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{activeAssets}</p>
                    <p className="text-xs text-gray-600">{((activeAssets / totalAssets) * 100).toFixed(0)}%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Maintenance</p>
                      <p className="text-xs text-gray-600">Under service</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{maintenanceAssets}</p>
                    <p className="text-xs text-gray-600">{((maintenanceAssets / totalAssets) * 100).toFixed(0)}%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Retired</p>
                      <p className="text-xs text-gray-600">Out of service</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{retiredAssets}</p>
                    <p className="text-xs text-gray-600">{((retiredAssets / totalAssets) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {lostAssets > 0 && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Lost</p>
                        <p className="text-xs text-gray-600">Missing assets</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{lostAssets}</p>
                      <p className="text-xs text-red-600">₨{(lostValue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {(lostAssets > 0 || assetsNeedingAttention.length > 0) && (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Critical Alerts</CardTitle>
                    <CardDescription>Assets requiring immediate attention</CardDescription>
                  </div>
                  <Badge variant="destructive" className="ml-auto">
                    {lostAssets + assetsNeedingAttention.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lostAssets > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Lost Assets ({lostAssets})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {assets.filter(a => a.status === 'lost').slice(0, 3).map(asset => (
                          <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                              <p className="text-xs text-gray-600">{asset.category}</p>
                            </div>
                            <p className="text-sm font-semibold text-red-600">₨{(asset.value / 1000).toFixed(0)}K</p>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Loss:</span>
                        <span className="font-bold text-red-600">₨{(lostValue / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  )}
                  
                  {assetsNeedingAttention.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Maintenance Due ({assetsNeedingAttention.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {assetsNeedingAttention.slice(0, 3).map(asset => (
                          <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                              <p className="text-xs text-gray-600">{asset.location}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {asset.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Utilization Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{utilizationRate}%</div>
                <Progress value={Number(utilizationRate)} className="mt-2 h-2" />
                <p className="text-xs text-gray-600 mt-2">
                  {activeAssets} of {totalAssets} assets active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Asset Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  ₨{(avgAssetValue / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Per asset in inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Asset Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(((totalAssets - lostAssets - maintenanceAssets) / totalAssets) * 100).toFixed(0)}%
                </div>
                <Progress 
                  value={((totalAssets - lostAssets - maintenanceAssets) / totalAssets) * 100} 
                  className="mt-2 h-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Overall health status
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Assets</CardTitle>
                  <CardDescription>Latest additions to inventory</CardDescription>
                </div>
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAssets.map((asset, index) => (
                  <div 
                    key={asset.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{asset.name}</p>
                        <p className="text-xs text-gray-600">{asset.category} • {asset.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₨{(asset.value / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-600">
                        {new Date(asset.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}






