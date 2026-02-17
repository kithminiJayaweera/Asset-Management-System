import { IAsset, IOrganization, IUser } from '../types';
import { ArrowLeft, UserX, UserPlus, Download, X, Eye, Search, User, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAssetAssignment, useAuditLogs, usePendingRequests } from '@/hooks/useAsset';
import { generateAssetQRData, downloadQRCode } from '../utils/qrCode';

interface AssetDetailProps {
  asset: IAsset;
  organization: IOrganization | undefined;
  assignedEmployee: IUser | undefined;
  employees: IUser[];
  onBack: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

export function AssetDetail({ asset, organization, assignedEmployee, employees, onBack, onEdit, onRefresh }: AssetDetailProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignFromRequestModal, setShowAssignFromRequestModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IUser | null>(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  const { assignAsset, unassignAsset, approveRequestAndAssign, loading, error } = useAssetAssignment(
    String(asset._id),
    onRefresh
  );

  const { logs: auditLogs, fetchLogs } = useAuditLogs('asset', String(asset._id));
  const { requests: pendingRequests, fetchRequests } = usePendingRequests(asset.category);

  useEffect(() => {
    fetchLogs();
    fetchRequests();
  }, [fetchLogs, fetchRequests]);

  const handleAssign = async () => {
    if (!selectedEmployee) return;
    
    try {
      await assignAsset(String(selectedEmployee._id));
      setShowAssignModal(false);
      setSelectedEmployee(null);
    } catch (err) {
      alert(error || 'Failed to assign asset');
    }
  };

  const handleUnassign = async () => {
    if (!confirm('Are you sure you want to unassign this asset?')) return;
    
    try {
      await unassignAsset();
    } catch (err) {
      alert(error || 'Failed to unassign asset');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequestAndAssign(requestId);
      setShowAssignFromRequestModal(false);
    } catch (err) {
      alert(error || 'Failed to approve request');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const isAssigned = Boolean(asset.assignedTo);
  const canAssign = asset.status !== 'retired' && asset.status !== 'lost';
  const qrCodeData = generateAssetQRData(String(asset._id), asset.name, asset.category, asset.location || '', asset.status);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-700 hover:text-black mb-4">
          <ArrowLeft className="w-5 h-5" />
          Back to Assets
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl text-black mb-2">{asset.name}</h2>
            <p className="text-gray-800">{asset.category}</p>
          </div>
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-full text-sm ${
              asset.status === 'active' ? 'bg-green-100 text-green-800' :
              asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {asset.status}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm ${
              isAssigned ? 'bg-purple-100 text-blue-800' : 'bg-gray-100 text-gray-700'
            }`}>
              {isAssigned ? 'Assigned' : 'Unassigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Assignment Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-black">Assignment</h3>
          <div className="flex gap-2">
            {isAssigned && (
              <button
                onClick={handleUnassign}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                <UserX className="w-4 h-4" />
                Unassign
              </button>
            )}
            {!isAssigned && pendingRequests.length > 0 && (
              <button
                onClick={() => setShowAssignFromRequestModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100"
              >
                <FileText className="w-4 h-4" />
                From Request ({pendingRequests.length})
              </button>
            )}
            <button
              onClick={() => setShowAssignModal(true)}
              disabled={!canAssign || loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isAssigned ? 'Reassign' : 'Assign'}
            </button>
          </div>
        </div>
        
        {assignedEmployee ? (
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-black">{assignedEmployee.name}</p>
              <p className="text-xs text-gray-700">{assignedEmployee.position} • {assignedEmployee.department}</p>
              <p className="text-xs text-gray-700">{assignedEmployee.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700">Not assigned</p>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black">Assign Employee 123</h3>
              <button onClick={() => setShowAssignModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-96 space-y-2 mb-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={String(emp._id)}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`border rounded-lg p-3 cursor-pointer ${
                    selectedEmployee?._id === emp._id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <p className="text-sm font-medium">{emp.name}</p>
                  <p className="text-xs text-gray-600">{emp.position} • {emp.department}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedEmployee || loading}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign from Request Modal */}
      {showAssignFromRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black">Assign to Requester</h3>
              <button onClick={() => setShowAssignFromRequestModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{request.requestedBy?.name}</p>
                      <p className="text-xs text-gray-600">{request.reason}</p>
                    </div>
                    <button
                      onClick={() => handleApproveRequest(request._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
