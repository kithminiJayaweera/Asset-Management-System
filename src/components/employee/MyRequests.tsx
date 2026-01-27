import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
}

interface MyRequestsProps {
  employee: Employee;
}

export function MyRequests({ employee }: MyRequestsProps) {
  const myRequests = [
    {
      id: '1',
      assetName: 'Dell Latitude 5540',
      category: 'PC/Laptop',
      quantity: 1,
      reason: 'Replacement for aging laptop - specs needed: i7 processor, 16GB RAM, 512GB SSD',
      priority: 'high',
      status: 'pending',
      requestDate: '2025-01-18'
    },
    {
      id: '2',
      assetName: 'Ergonomic Office Chair',
      category: 'Office Furniture',
      quantity: 1,
      reason: 'Back support improvement - need black leather material, height adjustable',
      priority: 'medium',
      status: 'approved',
      requestDate: '2025-01-15'
    },
    {
      id: '3',
      assetName: 'Company Vehicle - Van',
      category: 'Vehicle',
      quantity: 1,
      reason: 'Field service team transport - diesel van with cargo space',
      priority: 'high',
      status: 'pending',
      requestDate: '2025-01-12'
    },
    {
      id: '4',
      assetName: 'Dell U2723DE Monitor',
      category: 'Office Equipment',
      quantity: 2,
      reason: 'Dual monitor setup for development workflow optimization',
      priority: 'medium',
      status: 'approved',
      requestDate: '2025-01-10'
    },
    {
      id: '5',
      assetName: 'Cisco Networking Switch',
      category: 'Networking Equipment',
      quantity: 1,
      reason: 'Network infrastructure upgrade for better connectivity',
      priority: 'medium',
      status: 'rejected',
      requestDate: '2025-01-08'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const pendingCount = myRequests.filter(r => r.status === 'pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = myRequests.filter(r => r.status === 'rejected').length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900 mb-2">My Requests</h2>
        <p className="text-gray-600">Track your asset requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {myRequests.map(request => (
          <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  {getStatusIcon(request.status)}
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">{request.assetName}</h3>
                  <p className="text-sm text-gray-600">{request.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(request.priority)}`}>
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Quantity</p>
                <p className="text-sm text-gray-900">{request.quantity}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Request Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{new Date(request.requestDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <p className="text-sm text-gray-900 capitalize">{request.priority}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="text-sm text-gray-900">{request.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {myRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No requests found</p>
        </div>
      )}
    </div>
  );
}