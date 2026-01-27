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

interface EmployeeDashboardProps {
  employee: Employee;
}

export function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
  const myAssets = [
    { id: '1', name: 'Dell Latitude 5540', category: 'PC/Laptop', status: 'active', value: 150000 },
    { id: '2', name: 'Ergonomic Office Chair', category: 'Office Furniture', status: 'active', value: 25000 },
    { id: '3', name: 'Dell U2723DE Monitor', category: 'Office Equipment', status: 'active', value: 85000 }
  ];

  const myRequests = [
    { id: '1', assetName: 'Dell Latitude 5540', status: 'approved', requestDate: '2025-01-15' },
    { id: '2', assetName: 'Company Van', status: 'pending', requestDate: '2025-01-12' }
  ];

  const totalAssetValue = myAssets.reduce((sum, asset) => sum + asset.value, 0);
  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = myRequests.filter(r => r.status === 'approved').length;

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
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Value</p>
          <p className="text-2xl text-gray-900">Rs. {totalAssetValue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
          <p className="text-2xl text-gray-900">{pendingRequests}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Approved Requests</p>
          <p className="text-2xl text-gray-900">{approvedRequests}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">My Recent Assets</h3>
          <div className="space-y-3">
            {myAssets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900">{asset.name}</p>
                  <p className="text-xs text-gray-600">{asset.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">Rs. {asset.value.toLocaleString()}</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {asset.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Recent Requests</h3>
          <div className="space-y-3">
            {myRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900">{request.assetName}</p>
                  <p className="text-xs text-gray-600">{new Date(request.requestDate).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  request.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}