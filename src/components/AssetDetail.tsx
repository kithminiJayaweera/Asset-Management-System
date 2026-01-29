import { IAsset, IOrganization, IUser } from '../types';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, AlertCircle, User, Building2, Edit2, FileText, Clock, History, TrendingDown, UserX, UserPlus, Download, X, Eye, Search } from 'lucide-react';
import { calculateDepreciation, formatCurrency } from '../utils/depreciation';
import { generateAssetQRData, downloadQRCode } from '../utils/qrCode';
import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

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

interface AssetRequest {
  _id: string;
  requestedBy?: { _id: string; name: string; email: string; position?: string; department?: string } | null;
  assetCategory: string;
  requestType: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface AssetDetailProps {
  asset: IAsset;
  organization: IOrganization | undefined;
  assignedEmployee: IUser | undefined;
  employees: IUser[];
  onBack: () => void;
  onEdit: () => void;
  onReassign: (assetId: string, newEmployeeName: string | undefined, oldEmployeeName: string | undefined) => void;
}

export function AssetDetail({ asset, organization, assignedEmployee, employees, onBack, onEdit, onReassign }: AssetDetailProps) {
  const depreciation = calculateDepreciation(asset);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IUser | undefined>(assignedEmployee);
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<AssetRequest[]>([]);
  const [showAssignFromRequestModal, setShowAssignFromRequestModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignEmployee, setSelectedAssignEmployee] = useState<IUser | null>(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const qrCodeData = generateAssetQRData(String(asset._id), asset.name, asset.category, asset.location || '', asset.status);
  
  useEffect(() => {
    fetchPendingRequests();
  }, [asset.category]);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      const result = await response.json();
      if (result.success) {
        const filtered = result.data.filter((req: AssetRequest) => 
          req.assetCategory === asset.category && 
          req.status === 'pending' &&
          req.requestType === 'assignment'
        );
        setPendingRequests(filtered);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const assignToRequester = async (request: AssetRequest) => {
    if (!request.requestedBy || asset.assignedTo) return;
    
    try {
      const assetResponse = await fetch(`/api/assets/${asset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: request.requestedBy._id,
          status: 'assigned'
        }),
      });

      if (!assetResponse.ok) {
        alert('Failed to assign asset');
        return;
      }

      const requestResponse = await fetch(`/api/requests/${request._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset._id }),
      });

      if (requestResponse.ok) {
        alert('Asset assigned successfully!');
        setShowAssignFromRequestModal(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning asset:', error);
      alert('Error assigning asset');
    }
  };

  const unassignAsset = async () => {
    if (!confirm('Are you sure you want to unassign this asset?')) return;
    
    try {
      const assetResponse = await fetch(`/api/assets/${asset._id}`);
      const assetResult = await assetResponse.json();
      
      if (!assetResult.success) {
        alert('Failed to fetch asset details.');
        return;
      }

      const currentAsset = assetResult.data;
      let updatedDescription = currentAsset.description || '';
      
      if (assignedEmployee?.name && updatedDescription.includes(assignedEmployee.name)) {
        updatedDescription = updatedDescription.replace(new RegExp(`Assigned to: ${assignedEmployee.name}\.?\\s*`, 'gi'), '').trim();
      }

      const updateResponse = await fetch(`/api/assets/${asset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: null,
          status: 'available',
          description: updatedDescription
        }),
      });

      if (updateResponse.ok) {
        alert('Asset unassigned successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error unassigning asset:', error);
      alert('Error unassigning asset');
    }
  };

  const assignEmployeeToAsset = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/assets/${asset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: employeeId,
          status: 'assigned'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Employee assigned successfully!');
        setShowAssignModal(false);
        setSelectedAssignEmployee(null);
        window.location.reload();
      } else {
        alert('Failed to assign employee');
      }
    } catch (error) {
      console.error('Error assigning employee:', error);
      alert('Error assigning employee');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const handleReassign = () => {
    if (selectedEmployee) {
      onReassign(String(asset._id), selectedEmployee.name, assignedEmployee?.name);
    } else {
      onReassign(String(asset._id), undefined, assignedEmployee?.name);
    }
    setShowReassignModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-black mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Assets
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl text-black mb-2">{asset.name}</h2>
            <p className="text-gray-800">{asset.category}</p>
          </div>
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(asset.status)}`}>
              {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
            </span>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Asset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg text-black mb-4">Asset Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-1">Asset ID</p>
                  <p className="text-sm text-black">#{String(asset._id)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-1">Category</p>
                  <p className="text-sm text-black">{asset.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-1">Location</p>
                  <p className="text-sm text-black">{asset.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-1">Purchase Date</p>
                  <p className="text-sm text-black">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-1">Asset Value</p>
                  <p className="text-sm text-black">Rs. {asset.purchasePrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(asset.status)}`}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-black">Asset QR Code</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="View QR Code"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => downloadQRCode('qr-code-container', asset.name)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="Download QR Code"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg" id="qr-code-container">
              <QRCodeCanvas
                value={qrCodeData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-700 mt-3 text-center">
              Scan this QR code to quickly identify and track this asset
            </p>
          </div>

          {/* Category Specifications */}
          {asset.category && asset.details && Object.keys(asset.details).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg text-black mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(asset.details).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-700 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                    <p className="text-sm text-black">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {asset.description && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg text-black mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{asset.description}</p>
            </div>
          )}

          {/* Assignment Information */}
          {(asset.assignedTo || assignedEmployee) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-black">Assignment Information</h3>
                <div className="flex gap-2">
                  {asset.assignedTo && (
                    <button
                      onClick={unassignAsset}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                      Unassign
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAssignEmployee(assignedEmployee || null);
                      setShowAssignModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    {asset.assignedTo ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-1">Assigned To</p>
                  {assignedEmployee ? (
                    <>
                      <p className="text-sm text-black">{assignedEmployee.name}</p>
                      <p className="text-xs text-gray-700 mt-1">{assignedEmployee.position} • {assignedEmployee.department}</p>
                      <p className="text-xs text-gray-700">Employee ID: {assignedEmployee.employeeId}</p>
                      <p className="text-xs text-gray-700">Email: {assignedEmployee.email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-black">{String(asset.assignedTo)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Unassigned State */}
          {!asset.assignedTo && !assignedEmployee && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-black">Assignment Information</h3>
                <div className="flex gap-2">
                  {pendingRequests.length > 0 && (
                    <button
                      onClick={() => setShowAssignFromRequestModal(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Assign from Request ({pendingRequests.length})
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAssignEmployee(null);
                      setShowAssignModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Employee
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 rounded-lg p-4">
                <User className="w-5 h-5" />
                <p className="text-sm">This asset is currently not assigned to any employee</p>
              </div>
            </div>
          )}

          {/* Organization Information */}
          {organization && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg text-black mb-4">Organization</h3>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-black mb-1">{organization.name}</p>
                  <p className="text-xs text-gray-700 mt-2">{organization.address}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-700">Email: {organization.email}</p>
                    <p className="text-xs text-gray-700">Phone: {organization.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Asset History Log */}
          {/* Asset logs not available in current schema - can be added with AuditLog integration */}
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg text-black mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              {/* Purchase Value */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-700 mb-1">Purchase Value</p>
                <p className="text-lg text-black">{formatCurrency(depreciation.purchaseValue)}</p>
              </div>

              {/* Current Value */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-gray-700 mb-1">Current Value</p>
                <p className="text-lg text-black">{formatCurrency(depreciation.currentValue)}</p>
                <p className="text-xs text-gray-700 mt-1">After {depreciation.yearsElapsed.toFixed(1)} years</p>
              </div>

              {/* Depreciation Amount */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-gray-700">Depreciated Amount</p>
                </div>
                <p className="text-lg text-black">{formatCurrency(depreciation.depreciatedAmount)}</p>
                <p className="text-xs text-red-600 mt-1">{depreciation.depreciationPercentage.toFixed(1)}% loss</p>
              </div>

              {/* Depreciation Rate */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 mb-1">Annual Depreciation Rate</p>
                <p className="text-xl text-black">{depreciation.depreciationPercentage.toFixed(1)}%</p>
              </div>

              {/* Asset Age */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 mb-1">Asset Age</p>
                <p className="text-xl text-black">{depreciation.monthsElapsed} months</p>
                <p className="text-xs text-gray-700 mt-1">{depreciation.yearsElapsed.toFixed(2)} years</p>
              </div>

              {/* Current Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 mb-1">Current Status</p>
                <p className="text-xl text-black capitalize">{asset.status}</p>
              </div>

              {/* Assignment Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 mb-1">Assignment</p>
                <p className="text-xl text-black">
                  {asset.assignedTo ? 'Assigned' : 'Available'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm text-gray-700 mb-3">Timeline</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  <div>
                    <p className="text-xs text-black">Purchased</p>
                    <p className="text-xs text-gray-700">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {asset.assignedTo && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-xs text-black">Assigned to {String(asset.assignedTo)}</p>
                      <p className="text-xs text-gray-700">Current</p>
                    </div>
                  </div>
                )}
                {asset.status === 'maintenance' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-xs text-black">Under Maintenance</p>
                      <p className="text-xs text-gray-700">Current</p>
                    </div>
                  </div>
                )}
                {asset.status === 'retired' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-xs text-black">Retired</p>
                      <p className="text-xs text-gray-700">Current</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-slideUp border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl text-black">
                  {asset.assignedTo ? 'Reassign Asset' : 'Assign Asset'}
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  {asset.name}
                </p>
              </div>
              <button
                onClick={() => setShowReassignModal(false)}
                className="text-gray-600 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-3">
                Select Employee
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700" />
                <select
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-black"
                  value={selectedEmployee ? String(selectedEmployee._id) : ''}
                  onChange={(e) => {
                    const employeeId = e.target.value;
                    if (employeeId === '') {
                        setSelectedEmployee(undefined);
                      } else {
                        const employee = employees.find(emp => String(emp._id) === employeeId);
                        setSelectedEmployee(employee);
                      }
                  }}
                >
                  <option value="">-- Unassign Employee --</option>
                  {employees.map(emp => (
                    <option key={String(emp._id)} value={String(emp._id)}>
                      {emp.name} - {emp.position} ({emp.department})
                    </option>
                  ))}
                </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Selected Employee Preview */}
              {selectedEmployee && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-black">{selectedEmployee.name}</p>
                      <p className="text-xs text-gray-700 mt-1">
                        {selectedEmployee.position} • {selectedEmployee.department}
                      </p>
                      <p className="text-xs text-gray-700">
                        ID: {selectedEmployee.employeeId} • {selectedEmployee.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Unassign Preview */}
              {!selectedEmployee && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 text-gray-700">
                    <UserX className="w-4 h-4" />
                    <p className="text-sm">Asset will be unassigned</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReassignModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {selectedEmployee ? 'Reassign' : 'Unassign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-hidden transform transition-all animate-slideUp border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl text-black">{asset.assignedTo ? 'Reassign Employee' : 'Assign Employee'}</h3>
                <p className="text-sm text-gray-700 mt-1">{asset.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAssignEmployee(null);
                  setEmployeeSearchQuery('');
                }}
                className="text-gray-600 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees by name, email, department..."
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] space-y-2">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-700">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No employees found</p>
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    onClick={() => setSelectedAssignEmployee(employee)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAssignEmployee?._id === employee._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">{employee.name}</p>
                          <p className="text-xs text-gray-700">
                            {employee.position} • {employee.department}
                          </p>
                          <p className="text-xs text-gray-600">{employee.email}</p>
                        </div>
                      </div>
                      {selectedAssignEmployee?._id === employee._id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAssignEmployee(null);
                  setEmployeeSearchQuery('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedAssignEmployee && assignEmployeeToAsset(String(selectedAssignEmployee._id))}
                disabled={!selectedAssignEmployee}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {asset.assignedTo ? 'Reassign' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign from Request Modal */}
      {showAssignFromRequestModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto transform transition-all animate-slideUp border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl text-black">Assign to Requester</h3>
                <p className="text-sm text-gray-700 mt-1">
                  {asset.name} - {asset.category}
                </p>
              </div>
              <button
                onClick={() => setShowAssignFromRequestModal(false)}
                className="text-gray-600 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-700">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No pending requests for this category</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-black">{request.requestedBy?.name}</p>
                            <p className="text-xs text-gray-700">
                              {request.requestedBy?.position} • {request.requestedBy?.department}
                            </p>
                          </div>
                        </div>
                        <div className="ml-11">
                          <p className="text-xs text-gray-700 mb-1">Reason:</p>
                          <p className="text-sm text-gray-800">{request.reason}</p>
                          <p className="text-xs text-gray-700 mt-2">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => assignToRequester(request)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAssignFromRequestModal(false)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-black">Asset QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 flex justify-center mb-4" id="modal-qr-code">
              <QRCodeCanvas
                value={qrCodeData}
                size={300}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <p className="text-gray-800">
                <strong>Asset:</strong> {asset.name}
              </p>
              <p className="text-gray-800">
                <strong>Asset ID:</strong> #{String(asset._id)}
              </p>
              <p className="text-gray-800">
                <strong>Category:</strong> {asset.category}
              </p>
              <p className="text-gray-800">
                <strong>Location:</strong> {asset.location}
              </p>
              <p className="text-gray-800">
                <strong>Status:</strong> {asset.status}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => downloadQRCode('modal-qr-code', asset.name)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






