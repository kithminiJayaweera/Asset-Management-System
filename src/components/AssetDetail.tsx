import { Asset, Organization, Employee } from '../page';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, AlertCircle, User, Building2, Edit2, FileText, Clock, History, TrendingDown, UserX, UserPlus, Download, X, Eye } from 'lucide-react';
import { calculateDepreciation, formatCurrency } from '../utils/depreciation';
import { generateAssetQRData, downloadQRCode } from '../utils/qrCode';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface AssetDetailProps {
  asset: Asset;
  organization: Organization | undefined;
  assignedEmployee: Employee | undefined;
  employees: Employee[];
  onBack: () => void;
  onEdit: () => void;
  onReassign: (assetId: string, newEmployeeName: string | undefined, oldEmployeeName: string | undefined) => void;
}

export function AssetDetail({ asset, organization, assignedEmployee, employees, onBack, onEdit, onReassign }: AssetDetailProps) {
  const depreciation = calculateDepreciation(asset);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(assignedEmployee);
  const [showQRModal, setShowQRModal] = useState(false);
  const qrCodeData = generateAssetQRData(asset.id, asset.name, asset.category, asset.location, asset.status);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✓';
      case 'maintenance': return '⚠';
      case 'retired': return '✕';
      case 'lost': return '❌';
      default: return '•';
    }
  };

  const handleReassign = () => {
    if (selectedEmployee) {
      onReassign(asset.id, selectedEmployee.name, assignedEmployee?.name);
    } else {
      onReassign(asset.id, undefined, assignedEmployee?.name);
    }
    setShowReassignModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Assets
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl text-gray-900 mb-2">{asset.name}</h2>
            <p className="text-gray-600">{asset.category}</p>
          </div>
          <div className="flex gap-3">
            <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(asset.status)}`}>
              {getStatusIcon(asset.status)} {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
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
            <h3 className="text-lg text-gray-900 mb-4">Asset Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Asset ID</p>
                  <p className="text-sm text-gray-900">#{asset.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm text-gray-900">{asset.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-sm text-gray-900">{asset.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Purchase Date</p>
                  <p className="text-sm text-gray-900">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Asset Value</p>
                  <p className="text-sm text-gray-900">Rs. {asset.value.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
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
              <h3 className="text-lg text-gray-900">Asset QR Code</h3>
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
            <p className="text-xs text-gray-500 mt-3 text-center">
              Scan this QR code to quickly identify and track this asset
            </p>
          </div>
          {/* Category Specifications */}
          {asset.category && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PC/Laptop Specifications */}
                {(asset.category === 'PC/Laptop' || asset.category === 'Electronics' || asset.category === 'Computer') && (
                  <>
                    {(asset as any).brand && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Brand</p>
                        <p className="text-sm text-gray-900">{(asset as any).brand}</p>
                      </div>
                    )}
                    {(asset as any).model && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Model</p>
                        <p className="text-sm text-gray-900">{(asset as any).model}</p>
                      </div>
                    )}
                    {(asset as any).serialNumber && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                        <p className="text-sm text-gray-900">{(asset as any).serialNumber}</p>
                      </div>
                    )}
                    {(asset as any).processor && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Processor</p>
                        <p className="text-sm text-gray-900">{(asset as any).processor}</p>
                      </div>
                    )}
                    {(asset as any).ram && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">RAM</p>
                        <p className="text-sm text-gray-900">{(asset as any).ram}</p>
                      </div>
                    )}
                    {(asset as any).storage && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Storage</p>
                        <p className="text-sm text-gray-900">{(asset as any).storage}</p>
                      </div>
                    )}
                    {(asset as any).operatingSystem && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Operating System</p>
                        <p className="text-sm text-gray-900">{(asset as any).operatingSystem}</p>
                      </div>
                    )}
                    {(asset as any).macAddress && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">MAC Address</p>
                        <p className="text-sm text-gray-900 font-mono">{(asset as any).macAddress}</p>
                      </div>
                    )}
                    {(asset as any).warrantyEndDate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Warranty End Date</p>
                        <p className="text-sm text-gray-900">{new Date((asset as any).warrantyEndDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Furniture Specifications */}
                {(asset.category === 'Furniture' || asset.category === 'Office Furniture') && (
                  <>
                    {(asset as any).material && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Material</p>
                        <p className="text-sm text-gray-900">{(asset as any).material}</p>
                      </div>
                    )}
                    {(asset as any).color && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Color</p>
                        <p className="text-sm text-gray-900">{(asset as any).color}</p>
                      </div>
                    )}
                    {(asset as any).dimensions && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dimensions</p>
                        <p className="text-sm text-gray-900">{(asset as any).dimensions}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Vehicle Specifications */}
                {(asset.category === 'Vehicle' || asset.category === 'Vehicles' || asset.category === 'Car') && (
                  <>
                    {(asset as any).vehicleType && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vehicle Type</p>
                        <p className="text-sm text-gray-900">{(asset as any).vehicleType}</p>
                      </div>
                    )}
                    {(asset as any).registrationNumber && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                        <p className="text-sm text-gray-900">{(asset as any).registrationNumber}</p>
                      </div>
                    )}
                    {(asset as any).fuelType && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fuel Type</p>
                        <p className="text-sm text-gray-900">{(asset as any).fuelType}</p>
                      </div>
                    )}
                    {(asset as any).mileage && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mileage (km)</p>
                        <p className="text-sm text-gray-900">{(asset as any).mileage}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Common Specifications */}
                {(asset as any).condition && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Condition</p>
                    <p className="text-sm text-gray-900">{(asset as any).condition}</p>
                  </div>
                )}
                {(asset as any).lastMaintenanceDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Maintenance Date</p>
                    <p className="text-sm text-gray-900">{new Date((asset as any).lastMaintenanceDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {asset.description && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{asset.description}</p>
            </div>
          )}

          {/* Assignment Information */}
          {(asset.assignedTo || assignedEmployee) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-gray-900">Assignment Information</h3>
                <div className="flex gap-2">
                  {asset.assignedTo && (
                    <button
                      onClick={() => {
                        setSelectedEmployee(undefined);
                        setShowReassignModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                      Unassign
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedEmployee(assignedEmployee);
                      setShowReassignModal(true);
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
                  <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                  {assignedEmployee ? (
                    <>
                      <p className="text-sm text-gray-900">{assignedEmployee.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{assignedEmployee.position} • {assignedEmployee.department}</p>
                      <p className="text-xs text-gray-600">Employee ID: {assignedEmployee.employeeId}</p>
                      <p className="text-xs text-gray-600">Email: {assignedEmployee.email}</p>
                      <p className="text-xs text-gray-600">Phone: {assignedEmployee.phone}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-900">{asset.assignedTo}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Unassigned State */}
          {!asset.assignedTo && !assignedEmployee && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-gray-900">Assignment Information</h3>
                <button
                  onClick={() => {
                    setSelectedEmployee(undefined);
                    setShowReassignModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign Employee
                </button>
              </div>
              <div className="flex items-center gap-3 text-gray-500 bg-gray-50 rounded-lg p-4">
                <User className="w-5 h-5" />
                <p className="text-sm">This asset is currently not assigned to any employee</p>
              </div>
            </div>
          )}

          {/* Organization Information */}
          {organization && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4">Organization</h3>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 mb-1">{organization.name}</p>
                  <p className="text-xs text-gray-600">Code: {organization.code}</p>
                  <p className="text-xs text-gray-600 mt-2">{organization.address}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">Email: {organization.contactEmail}</p>
                    <p className="text-xs text-gray-600">Phone: {organization.contactPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Asset History Log */}
          {asset.logs && asset.logs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg text-gray-900">Asset History</h3>
              </div>
              
              <div className="space-y-4">
                {asset.logs.slice().reverse().map((log, index) => {
                  const getLogIcon = (action: string) => {
                    switch (action) {
                      case 'created': return '🎉';
                      case 'assigned': return '👤';
                      case 'unassigned': return '🔄';
                      case 'status_change': return '⚙️';
                      case 'location_change': return '📍';
                      default: return '📝';
                    }
                  };

                  const getLogColor = (action: string) => {
                    switch (action) {
                      case 'created': return 'bg-blue-50 border-blue-200';
                      case 'assigned': return 'bg-green-50 border-green-200';
                      case 'unassigned': return 'bg-yellow-50 border-yellow-200';
                      case 'status_change': return 'bg-purple-50 border-purple-200';
                      case 'location_change': return 'bg-orange-50 border-orange-200';
                      default: return 'bg-gray-50 border-gray-200';
                    }
                  };

                  const getLogTitle = (log: any) => {
                    switch (log.action) {
                      case 'created':
                        return 'Asset Created';
                      case 'assigned':
                        return `Assigned to ${log.assignedTo}`;
                      case 'unassigned':
                        return `Unassigned from ${log.assignedFrom}`;
                      case 'status_change':
                        return `Status changed: ${log.oldStatus} → ${log.newStatus}`;
                      case 'location_change':
                        return `Location changed: ${log.oldLocation} → ${log.newLocation}`;
                      default:
                        return 'Asset Updated';
                    }
                  };

                  return (
                    <div 
                      key={log.id} 
                      className={`relative pl-8 pb-4 ${index !== asset.logs!.length - 1 ? 'border-l-2 border-gray-200' : ''}`}
                    >
                      <div className={`absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full border-2 flex items-center justify-center text-xs ${getLogColor(log.action)}`}>
                        {getLogIcon(log.action)}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${getLogColor(log.action)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm text-gray-900">{getLogTitle(log)}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(log.performedDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Performed by: <span className="font-medium">{log.performedBy}</span></p>
                          {log.notes && (
                            <p className="italic mt-2">{log.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              {/* Purchase Value */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Purchase Value</p>
                <p className="text-lg text-gray-900">{formatCurrency(depreciation.purchaseValue)}</p>
              </div>

              {/* Current Value */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Current Value</p>
                <p className="text-lg text-gray-900">{formatCurrency(depreciation.currentValue)}</p>
                <p className="text-xs text-gray-500 mt-1">After {depreciation.yearsElapsed.toFixed(1)} years</p>
              </div>

              {/* Depreciation Amount */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-gray-600">Depreciated Amount</p>
                </div>
                <p className="text-lg text-gray-900">{formatCurrency(depreciation.depreciatedAmount)}</p>
                <p className="text-xs text-red-600 mt-1">{depreciation.depreciationPercentage.toFixed(1)}% loss</p>
              </div>

              {/* Depreciation Rate */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Annual Depreciation Rate</p>
                <p className="text-xl text-gray-900">{asset.depreciationRate || 10}%</p>
              </div>

              {/* Asset Age */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Asset Age</p>
                <p className="text-xl text-gray-900">{depreciation.monthsElapsed} months</p>
                <p className="text-xs text-gray-500 mt-1">{depreciation.yearsElapsed.toFixed(2)} years</p>
              </div>

              {/* Current Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Current Status</p>
                <p className="text-xl text-gray-900 capitalize">{asset.status}</p>
              </div>

              {/* Assignment Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Assignment</p>
                <p className="text-xl text-gray-900">
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
                    <p className="text-xs text-gray-900">Purchased</p>
                    <p className="text-xs text-gray-500">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {asset.assignedTo && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-xs text-gray-900">Assigned to {asset.assignedTo}</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                  </div>
                )}
                {asset.status === 'maintenance' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-xs text-gray-900">Under Maintenance</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                  </div>
                )}
                {asset.status === 'retired' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1"></div>
                    <div>
                      <p className="text-xs text-gray-900">Retired</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                  </div>
                )}
                {asset.status === 'lost' && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
                    <div>
                      <p className="text-xs text-gray-900">Lost</p>
                      <p className="text-xs text-gray-500">Current</p>
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
                <h3 className="text-xl text-gray-900">
                  {asset.assignedTo ? 'Reassign Asset' : 'Assign Asset'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {asset.name}
                </p>
              </div>
              <button
                onClick={() => setShowReassignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
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
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const employeeId = e.target.value;
                    if (employeeId === '') {
                      setSelectedEmployee(undefined);
                    } else {
                      const employee = employees.find(emp => emp.id === employeeId);
                      setSelectedEmployee(employee);
                    }
                  }}
                >
                  <option value="">-- Unassign Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position} ({emp.department})
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <p className="text-sm text-gray-900">{selectedEmployee.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedEmployee.position} • {selectedEmployee.department}
                      </p>
                      <p className="text-xs text-gray-600">
                        ID: {selectedEmployee.employeeId} • {selectedEmployee.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Unassign Preview */}
              {!selectedEmployee && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 text-gray-600">
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

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Asset QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
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
              <p className="text-gray-600">
                <strong>Asset:</strong> {asset.name}
              </p>
              <p className="text-gray-600">
                <strong>Asset ID:</strong> #{asset.id}
              </p>
              <p className="text-gray-600">
                <strong>Category:</strong> {asset.category}
              </p>
              <p className="text-gray-600">
                <strong>Location:</strong> {asset.location}
              </p>
              <p className="text-gray-600">
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
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
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