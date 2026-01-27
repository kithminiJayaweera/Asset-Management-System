import { Employee, Organization, Asset } from '../page';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, Package, User, Building2, AlertCircle } from 'lucide-react';

interface EmployeeDetailProps {
  employee: Employee;
  organization: Organization | undefined;
  assignedAssets: Asset[];
  onBack: () => void;
}

export function EmployeeDetail({ employee, organization, assignedAssets, onBack }: EmployeeDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssetStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAssetValue = assignedAssets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Employees
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl text-gray-900 mb-2">{employee.name}</h2>
            <p className="text-gray-600">{employee.position} • {employee.department}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(employee.status)}`}>
            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Employee ID</p>
                  <p className="text-sm text-gray-900">{employee.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{employee.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Organization</p>
                  <p className="text-sm text-gray-900">{organization?.name || 'N/A'}</p>
                </div>
              </div>

              {employee.address && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{employee.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employment Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="text-sm text-gray-900">{new Date(employee.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Salary</p>
                  <p className="text-sm text-gray-900">Rs. {employee.salary.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Card */}
          {(employee.emergencyContact || employee.emergencyContactPhone) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.emergencyContact && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contact Name</p>
                      <p className="text-sm text-gray-900">{employee.emergencyContact}</p>
                    </div>
                  </div>
                )}

                {employee.emergencyContactPhone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Phone className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contact Phone</p>
                      <p className="text-sm text-gray-900">{employee.emergencyContactPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assigned Assets Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Assigned Assets</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {assignedAssets.length}
              </span>
            </div>

            {assignedAssets.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No assets assigned</p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Asset Value</p>
                  <p className="text-xl text-gray-900">Rs. {totalAssetValue.toLocaleString()}</p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {assignedAssets.map(asset => (
                    <div key={asset.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm text-gray-900 mb-1">{asset.name}</h4>
                          <p className="text-xs text-gray-500">{asset.category}</p>
                        </div>
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs ${getAssetStatusColor(asset.status)}`}>
                          {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-600">Rs. {asset.value.toLocaleString()}</span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Location: {asset.location}</p>
                        <p className="text-xs text-gray-500">Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}</p>
                      </div>

                      {asset.description && (
                        <p className="text-xs text-gray-600 mt-2 italic">{asset.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
