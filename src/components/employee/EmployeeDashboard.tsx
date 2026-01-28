"use client";

import { useState, useEffect } from 'react';
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  organizationId: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'on-leave' | 'inactive';
}

interface Asset {
  _id: string;
  name: string;
  category: string;
  status: string;
  purchasePrice?: number;
  currentValue?: number;
}

interface AssetRequest {
  _id: string;
  assetId?: { name: string };
  assetName?: string;
  status: string;
  requestDate?: string;
  createdAt?: string;
}

interface EmployeeDashboardProps {
  employee: Employee;
}

export function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [myRequests, setMyRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [employee.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch assets assigned to this employee
      const assetsResponse = await fetch(`/api/assets?search=${employee.name}`);
      const assetsResult = await assetsResponse.json();
      
      if (assetsResult.success) {
        const assetsData = assetsResult.data.data || assetsResult.data;
        const assignedAssets = (Array.isArray(assetsData) ? assetsData : []).filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (asset: any) => asset.assignedTo?._id === employee.id || asset.assignedTo === employee.id
        );
        setMyAssets(assignedAssets);
      }

      // Fetch asset requests made by this employee
      const requestsResponse = await fetch(`/api/requests?requestedBy=${employee.id}`);
      const requestsResult = await requestsResponse.json();
      
      if (requestsResult.success) {
        const requestsData = Array.isArray(requestsResult.data) ? requestsResult.data : [];
        setMyRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalAssetValue = myAssets.reduce((sum, asset) => sum + (asset.currentValue || asset.purchasePrice || 0), 0);
  const activeAssets = myAssets.filter(a => a.status === 'active' || a.status === 'available').length;
  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = myRequests.filter(r => r.status === 'approved').length;
  const maintenanceAssets = myAssets.filter(a => a.status === 'maintenance').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900 mb-2">Welcome, {employee.name}</h2>
        <p className="text-gray-600">{employee.position} • {employee.department}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">My Assets</p>
          <p className="text-2xl text-gray-900">{myAssets.length}</p>
          <p className="text-xs text-gray-500 mt-2">{activeAssets} active</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Value</p>
          <p className="text-2xl text-gray-900">Rs. {totalAssetValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">All assigned assets</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
          <p className="text-2xl text-gray-900">{pendingRequests}</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Approved Requests</p>
          <p className="text-2xl text-gray-900">{approvedRequests}</p>
          <p className="text-xs text-gray-500 mt-2">Ready to receive</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Asset Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Assets</span>
              <span className="text-lg font-semibold text-gray-900">{myAssets.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active</span>
              <span className="text-lg font-semibold text-green-600">{activeAssets}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">In Maintenance</span>
              <span className="text-lg font-semibold text-yellow-600">{maintenanceAssets}</span>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Value</span>
                <span className="text-lg font-semibold text-blue-600">Rs. {totalAssetValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Request Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Requests</span>
              <span className="text-lg font-semibold text-gray-900">{myRequests.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="text-lg font-semibold text-yellow-600">{pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Approved</span>
              <span className="text-lg font-semibold text-green-600">{approvedRequests}</span>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="text-lg font-semibold text-blue-600">
                  {myRequests.length > 0 ? Math.round((approvedRequests / myRequests.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">My Recent Assets</h3>
          {myAssets.length > 0 ? (
            <div className="space-y-3">
              {myAssets.slice(0, 5).map(asset => (
                <div key={asset._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-900">{asset.name}</p>
                    <p className="text-xs text-gray-600">{asset.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">Rs. {(asset.currentValue || asset.purchasePrice || 0).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      asset.status === 'active' || asset.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No assets assigned yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Recent Requests</h3>
          {myRequests.length > 0 ? (
            <div className="space-y-3">
              {myRequests.slice(0, 5).map(request => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-900">{request.assetId?.name || request.assetName}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(request.requestDate || request.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No requests made yet</p>
          )}
        </div>
      </div>
    </div>
  );
}