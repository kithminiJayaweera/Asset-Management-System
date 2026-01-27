import { useState } from 'react';
import { Organization, SubAdmin } from '../page';
import { Building2, ArrowLeft, Mail, Phone, MapPin, Calendar, Users, UserPlus, Edit2, Trash2, Shield } from 'lucide-react';

interface OrganizationDetailProps {
  organization: Organization;
  subAdmins: SubAdmin[];
  onBack: () => void;
  onAddAdmin: (admin: Omit<SubAdmin, 'id'>) => void;
  onUpdateAdmin: (admin: SubAdmin) => void;
  onDeleteAdmin: (id: string) => void;
  onEditOrganization: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_assets', label: 'View Assets' },
  { id: 'add_assets', label: 'Add Assets' },
  { id: 'edit_assets', label: 'Edit Assets' },
  { id: 'delete_assets', label: 'Delete Assets' },
  { id: 'view_employees', label: 'View Employees' },
  { id: 'add_employees', label: 'Add Employees' },
  { id: 'edit_employees', label: 'Edit Employees' },
  { id: 'delete_employees', label: 'Delete Employees' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'manage_settings', label: 'Manage Settings' }
];

export function OrganizationDetail({ 
  organization, 
  subAdmins, 
  onBack, 
  onAddAdmin, 
  onUpdateAdmin,
  onDeleteAdmin,
  onEditOrganization 
}: OrganizationDetailProps) {
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'sub-admin' as 'admin' | 'sub-admin',
    permissions: [] as string[]
  });

  // Filter admins for this organization
  const organizationAdmins = subAdmins.filter(admin => admin.organizationId === organization.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAdmin) {
      // Update existing admin
      onUpdateAdmin({
        ...editingAdmin,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions
      });
      setEditingAdmin(null);
    } else {
      // Add new admin
      onAddAdmin({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organizationId: organization.id,
        permissions: formData.permissions,
        createdDate: new Date().toISOString().split('T')[0]
      });
    }
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      role: 'sub-admin',
      permissions: []
    });
    setShowAddAdminForm(false);
  };

  const handleEdit = (admin: SubAdmin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    });
    setShowAddAdminForm(true);
  };

  const handleCancel = () => {
    setShowAddAdminForm(false);
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      role: 'sub-admin',
      permissions: []
    });
  };

  const togglePermission = (permissionId: string) => {
    if (formData.permissions.includes(permissionId)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permissionId)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionId]
      });
    }
  };

  const toggleAllPermissions = () => {
    if (formData.permissions.length === AVAILABLE_PERMISSIONS.length) {
      setFormData({ ...formData, permissions: [] });
    } else {
      setFormData({ ...formData, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Organizations
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl text-gray-900">{organization.name}</h2>
              <p className="text-gray-600">Code: {organization.code}</p>
            </div>
          </div>
          <button
            onClick={onEditOrganization}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Organization
          </button>
        </div>
      </div>

      {/* Organization Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg text-gray-900 mb-4">Organization Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-gray-900">{organization.address}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900">{organization.contactEmail}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900">{organization.contactPhone}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Created Date</p>
              <p className="text-gray-900">{new Date(organization.createdDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-700" />
            <h3 className="text-lg text-gray-900">Assigned Admins ({organizationAdmins.length})</h3>
          </div>
          {!showAddAdminForm && (
            <button
              onClick={() => setShowAddAdminForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Assign Admin
            </button>
          )}
        </div>

        {/* Add/Edit Admin Form */}
        {showAddAdminForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-gray-900 mb-4">
              {editingAdmin ? 'Edit Admin' : 'Assign New Admin'}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., john@company.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'sub-admin' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sub-admin">Sub Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm text-gray-700">
                    Permissions *
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllPermissions}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {formData.permissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-lg border border-gray-200">
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAdmin ? 'Update Admin' : 'Assign Admin'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins List */}
        {organizationAdmins.length > 0 ? (
          <div className="space-y-4">
            {organizationAdmins.map(admin => (
              <div key={admin.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-1">{admin.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{admin.email}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          admin.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role === 'admin' ? 'Admin' : 'Sub Admin'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Added: {new Date(admin.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-2">
                          {admin.permissions.includes('all') ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              All Permissions
                            </span>
                          ) : (
                            admin.permissions.map(perm => {
                              const permission = AVAILABLE_PERMISSIONS.find(p => p.id === perm);
                              return permission ? (
                                <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {permission.label}
                                </span>
                              ) : null;
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove this admin?')) {
                          onDeleteAdmin(admin.id);
                        }
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No admins assigned to this organization yet</p>
            <p className="text-sm text-gray-500">Click "Assign Admin" to add admins</p>
          </div>
        )}
      </div>
    </div>
  );
}
