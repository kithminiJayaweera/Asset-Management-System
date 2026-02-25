import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface Employee {
  id: string;
  name: string;
}

interface AssetRequest {
  _id: string;
  assetId?: {
    name: string;
    category: string;
  };
  requestType: string;
  reason: string;
  priority: string;
  status: string;
  createdAt: string;
  quantity?: number;
}

interface MyRequestsProps {
  employee: Employee;
}

export function MyRequests({ employee }: MyRequestsProps) {
  const [myRequests, setMyRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string; status: string} | null>(null);

  useEffect(() => {
    fetchMyRequests();
  }, [employee.id]);

  const fetchMyRequests = async () => {
    try {
      const response = await fetch(`/api/requests?requestedBy=${employee.id}`);
      const result = await response.json();
      if (result.success) {
        setMyRequests(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (request: AssetRequest) => {
    if (request.status !== 'pending') {
      toast.warning('Only pending requests can be edited');
      return;
    }
    
    const newReason = prompt('Update reason:', request.reason);
    if (!newReason) return;
    
    try {
      const response = await fetch(`/api/requests/${request._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: newReason })
      });
      
      if (response.ok) {
        fetchMyRequests();
        toast.success('Request updated successfully');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const handleDelete = async (requestId: string, status: string) => {
    if (status !== 'pending') {
      toast.warning('Only pending requests can be deleted');
      return;
    }
    
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMyRequests(prev => prev.filter(r => r._id !== requestId));
        toast.success('Request deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-800">Loading requests...</p>
      </div>
    );
  }

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
      case 'low': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-700" />;
    }
  };

  const pendingCount = myRequests.filter(r => r.status === 'pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = myRequests.filter(r => r.status === 'rejected').length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-black mb-2">My Requests</h2>
        <p className="text-gray-800">Track your asset requests</p>
      </div>

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

      <div className="space-y-4">
        {myRequests.map(request => (
          <div key={request._id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  {getStatusIcon(request.status)}
                </div>
                <div>
                  <h3 className="text-lg text-black">{request.assetId?.name || 'Asset Request'}</h3>
                  <p className="text-sm text-gray-700">{request.assetId?.category || request.requestType}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(request.priority)}`}>
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                </span>
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleEdit(request)}
                      className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Edit Request"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({id: request._id, status: request.status})}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-700 mb-1">Quantity</p>
                <p className="text-sm text-black">{request.quantity || 1}</p>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Request Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-700" />
                  <p className="text-sm text-black">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Priority</p>
                <p className="text-sm text-black capitalize">{request.priority}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-700 mb-1">Reason</p>
              <p className="text-sm text-black">{request.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {myRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-800">No requests found</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Request"
        message="Are you sure you want to delete this request?"
        onConfirm={() => {
          if (deleteConfirm) {
            handleDelete(deleteConfirm.id, deleteConfirm.status);
            setDeleteConfirm(null);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}






