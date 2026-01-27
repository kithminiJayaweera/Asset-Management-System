import { useState } from 'react';
import { SubAdmin, Organization } from '../page';
import { Shield, Plus, Search, Filter, Edit2, Trash2, Mail, Building2, Calendar, UserPlus } from 'lucide-react';

interface OrganizationAdminListProps {
  subAdmins: SubAdmin[];
  organizations: Organization[];
  onAdd: (admin: Omit<SubAdmin, 'id'>) => void;
  onUpdate: (admin: SubAdmin) => void;
  onDelete: (id: string) => void;
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

export function OrganizationAdminList({ subAdmins, organizations, onAdd, onUpdate, onDelete }: OrganizationAdminListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'sub-admin' as 'admin' | 'sub-admin',
    organizationId: '',
    permissions: ['all'] as string[]
  });

  const filteredAdmins = subAdmins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrganization = filterOrganization === 'all' || admin.organizationId === filterOrganization;
    return matchesSearch && matchesOrganization;
  });

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'N/A';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAdmin) {
      onUpdate({
        ...editingAdmin,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organizationId: formData.organizationId,
        permissions: formData.permissions
      });
      setEditingAdmin(null);
    } else {
      onAdd({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organizationId: formData.organizationId,
        permissions: formData.permissions,
        createdDate: new Date().toISOString().split('T')[0]
      });
    }
    
    setFormData({
      name: '',
      email: '',
      role: 'sub-admin',
      organizationId: '',
      permissions: ['all']
    });
    setShowAddForm(false);
  };

  const handleEdit = (admin: SubAdmin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      organizationId: admin.organizationId,
      permissions: admin.permissions
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      role: 'sub-admin',
      organizationId: '',
      permissions: ['all']
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Organization Admins</h2>
          <p className="text-gray-600">Manage organization administrators</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Admin
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg text-gray-900 mb-4">
            {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., admin@company.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Role *</label>
                <input
                  type="text"
                  value="Sub Admin"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Organization *</label>
                <select
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select Organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">Permissions *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('all')}
                    onChange={() => {
                      if (formData.permissions.includes('all')) {
                        setFormData({ ...formData, permissions: [] });
                      } else {
                        setFormData({ ...formData, permissions: ['all'] });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">All Permissions</span>
                </label>
                {AVAILABLE_PERMISSIONS.map(permission => (
                  <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      disabled={formData.permissions.includes('all')}
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
                {editingAdmin ? 'Update Admin' : 'Add Admin'}
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

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterOrganization}
              onChange={(e) => setFilterOrganization(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-900"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Admin Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAdmins.map(admin => (
          <div key={admin.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">{admin.name}</h3>
                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Sub Admin
                  </span>
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
                    if (window.confirm('Are you sure you want to delete this admin?')) {
                      onDelete(admin.id);
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{admin.email}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{getOrganizationName(admin.organizationId)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Created: {new Date(admin.createdDate).toLocaleDateString()}</span>
              </div>

              <div>
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
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No organization admins found</p>
        </div>
      )}
    </div>
  );
}