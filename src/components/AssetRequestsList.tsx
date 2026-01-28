'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, User, Loader2 } from 'lucide-react';

interface RequestedByUser {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
}

interface AssetRequest {
  _id: string;
  requestedBy?: RequestedByUser | null;
  assetCategory: string;
  requestType: 'assignment' | 'return' | 'maintenance' | 'new';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: RequestedByUser;
  approvalDate?: string;
  notes?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export function AssetRequestsList() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests');
      const result = await response.json();
      
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesType = filterType === 'all' || req.requestType === filterType;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'new': return 'New Asset';
      case 'assignment': return 'Assignment';
      case 'return': return 'Return';
      case 'maintenance': return 'Maintenance';
      default: return type;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-black mb-2">Asset Requests</h2>
        <p className="text-gray-800">Manage employee asset requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Pending</p>
              <p className="text-2xl text-black">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Approved</p>
              <p className="text-2xl text-black">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Rejected</p>
              <p className="text-2xl text-black">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Types</option>
              <option value="new">New Asset</option>
              <option value="assignment">Assignment</option>
              <option value="return">Return</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map(request => (
          <div key={request._id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg text-black">
                    {request.requestedBy?.name || 'Unknown Employee'}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {request.requestedBy?.position || 'Employee'} 
                    {request.requestedBy?.department && ` • ${request.requestedBy.department}`}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {request.requestedBy?.email || 'No email'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  {getRequestTypeLabel(request.requestType)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-700 mb-1">Asset Category</p>
                <p className="text-sm text-black">{request.assetCategory}</p>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Request Type</p>
                <p className="text-sm text-black">{getRequestTypeLabel(request.requestType)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Request Date</p>
                <p className="text-sm text-black">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-700 mb-1">Reason</p>
              <p className="text-sm text-black">{request.reason}</p>
            </div>

            {request.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 mb-1">Notes</p>
                <p className="text-sm text-black">{request.notes}</p>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => updateRequestStatus(request._id, 'approved')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => updateRequestStatus(request._id, 'rejected', 'Request denied')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}

            {request.status === 'approved' && request.approvalDate && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-green-700">
                  Approved on {new Date(request.approvalDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-800">No asset requests found</p>
          <p className="text-sm text-gray-600 mt-2">
            {filterStatus !== 'all' || filterType !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Create requests via API or add test data using the seed endpoint'}
          </p>
        </div>
      )}
    </div>
  );
}
