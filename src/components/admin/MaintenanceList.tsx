'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MaintenanceRecord {
  _id: string;
  assetId: {
    _id: string;
    name: string;
    assetTag?: string;
  };
  issueTitle: string;
  issueDescription: string;
  maintenanceType: 'preventive' | 'corrective' | 'warranty';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'closed' | 'cancelled';
  estimatedCost?: number;
  actualCost?: number;
  assignedVendor?: string;
  expectedReturnDate?: string;
  completionDate?: string;
  performedBy?: string;
  notes?: string;
  createdAt: string;
}

interface MaintenanceListProps {
  onSelectMaintenance?: (record: MaintenanceRecord) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'closed': 'bg-red-100 text-red-900',
    'cancelled': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = {
    'low': 'bg-green-50 text-green-700 border border-green-200',
    'medium': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    'high': 'bg-orange-50 text-orange-700 border border-orange-200',
    'critical': 'bg-red-50 text-red-700 border border-red-200',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || 'bg-gray-50'}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export function MaintenanceList({ onSelectMaintenance, onUpdateStatus }: MaintenanceListProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { socket } = useSocket();

  // Initial fetch
  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new maintenance records
    socket.on('maintenance_created', (data) => {
      console.log('🆕 New maintenance record created:', data);
      setRecords((prev) => [data.data, ...prev]);
      toast.success('🔔 New maintenance record created', {
        description: `${data.data.assetId?.name || 'Asset'} - ${data.issueTitle}`,
      });
    });

    // Listen for updated maintenance records
    socket.on('maintenance_updated', (data) => {
      console.log('🔄 Maintenance record updated:', data);
      setRecords((prev) =>
        prev.map((record) =>
          record._id === data.maintenanceId ? { ...record, ...data.data } : record
        )
      );
      toast.success('✅ Maintenance record updated', {
        description: `Status: ${data.status}`,
      });
    });

    // Listen for deleted maintenance records
    socket.on('maintenance_deleted', (data) => {
      console.log('🗑️ Maintenance record deleted:', data);
      setRecords((prev) => prev.filter((record) => record._id !== data.maintenanceId));
      toast.success('🗑️ Maintenance record deleted');
    });

    return () => {
      socket.off('maintenance_created');
      socket.off('maintenance_updated');
      socket.off('maintenance_deleted');
    };
  }, [socket]);

  // Polling fallback - refresh every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(fetchMaintenanceRecords, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance');
      const result = await response.json();
      
      if (result.success) {
        setRecords(result.data || []);
      } else {
        toast.error('Failed to fetch maintenance records');
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast.error('Error loading maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMaintenanceClick = async (record: MaintenanceRecord) => {
    if (onSelectMaintenance) {
      onSelectMaintenance(record);
    }
  };

  const handleUpdateStatus = async (recordId: string, newStatus: string) => {
    try {
      setUpdatingId(recordId);
      const response = await fetch(`/api/maintenance/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          performedBy: 'Admin'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Real-time socket event will update the UI automatically
        toast.success(`Maintenance status updated to ${newStatus}`);
        onUpdateStatus?.(recordId, newStatus);
      } else {
        toast.error(result.error || 'Failed to update maintenance status');
      }
    } catch (error) {
      console.error('Error updating maintenance:', error);
      toast.error('Error updating maintenance status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchQuery || 
      (record.assetId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.issueTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.maintenanceType === typeFilter;
    const matchesPriority = priorityFilter === 'all' || record.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="text-gray-600">Loading maintenance records...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-4">Maintenance Records</h1>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search asset or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
          >
            <option value="all">All Types</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="warranty">Warranty</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
            <div className="text-xs text-blue-700">Total</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">{filteredRecords.filter(r => r.status === 'pending').length}</div>
            <div className="text-xs text-gray-700">Pending</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredRecords.filter(r => r.status === 'in-progress').length}</div>
            <div className="text-xs text-blue-700">In Progress</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{filteredRecords.filter(r => r.status === 'completed').length}</div>
            <div className="text-xs text-green-700">Completed</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">{filteredRecords.filter(r => r.status === 'closed').length}</div>
            <div className="text-xs text-red-800">Closed</div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No maintenance records found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Asset</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Issue</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Est. Cost</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    <div className="flex flex-col">
                      <span>{record.assetId?.name || 'Unknown Asset'}</span>
                      {record.assetId?.assetTag && <span className="text-xs text-gray-500">{record.assetId.assetTag}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="max-w-xs truncate" title={record.issueTitle}>
                      {record.issueTitle}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {record.maintenanceType}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <PriorityBadge priority={record.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    Rs. {record.estimatedCost?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm space-x-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="text-red-700 hover:text-red-900 font-medium text-xs px-3 py-1 bg-red-50 hover:bg-red-100 rounded-md"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle>Maintenance Record Details</DialogTitle>
                <DialogDescription>
                  {selectedRecord.assetId?.name || 'Asset'} - {selectedRecord.issueTitle}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <label className="text-xs text-gray-600 font-semibold">Asset Information</label>
                  <div className="flex items-start justify-between mt-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedRecord.assetId?.name || 'Unknown Asset'}</p>
                      {selectedRecord.assetId?.assetTag && <p className="text-xs text-gray-500">{selectedRecord.assetId.assetTag}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 font-semibold">Description</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRecord.issueDescription}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold">Vendor</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRecord.assignedVendor || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold">Expected Return</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedRecord.expectedReturnDate 
                        ? new Date(selectedRecord.expectedReturnDate).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold">Performed By</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRecord.performedBy || 'Pending'}</p>
                  </div>
                  {selectedRecord.actualCost && (
                    <div>
                      <label className="text-xs text-gray-600 font-semibold">Actual Cost</label>
                      <p className="text-sm text-gray-900 mt-1">Rs. {selectedRecord.actualCost.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedRecord.completionDate && (
                    <div>
                      <label className="text-xs text-gray-600 font-semibold">Completed</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(selectedRecord.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedRecord.notes && (
                  <div>
                    <label className="text-xs text-gray-600 font-semibold">Notes</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedRecord.notes}</p>
                  </div>
                )}

                {/* Status Update Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-300">
                  {selectedRecord.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRecord._id, 'in-progress')}
                      disabled={updatingId === selectedRecord._id}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
                    >
                      {updatingId === selectedRecord._id ? 'Updating...' : 'Start Work'}
                    </button>
                  )}

                  {(selectedRecord.status === 'pending' || selectedRecord.status === 'in-progress') && (
                    <button
                      onClick={() => handleCompleteMaintenanceClick(selectedRecord)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Mark Completed
                    </button>
                  )}

                  {selectedRecord.status === 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRecord._id, 'closed')}
                      disabled={updatingId === selectedRecord._id}
                      className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 text-sm font-medium"
                    >
                      {updatingId === selectedRecord._id ? 'Updating...' : 'Close Maintenance'}
                    </button>
                  )}

                  {(selectedRecord.status === 'pending' || selectedRecord.status === 'in-progress') && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRecord._id, 'cancelled')}
                      disabled={updatingId === selectedRecord._id}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
