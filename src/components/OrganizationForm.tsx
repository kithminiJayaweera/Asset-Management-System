/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Organization, SubAdmin } from '../page';
import { Save, X, UserPlus } from 'lucide-react';

interface OrganizationFormProps {
  onSubmit: (org: any, admin?: Omit<SubAdmin, 'id' | 'organizationId' | 'createdDate'>) => void;
  initialData?: Organization | null;
  onCancel: () => void;
}

export function OrganizationForm({ onSubmit, initialData, onCancel }: OrganizationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    address: initialData?.address || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    createdDate: initialData?.createdDate || new Date().toISOString().split('T')[0]
  });

  const [createAdmin, setCreateAdmin] = useState(false);
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    role: 'admin' as 'admin' | 'sub-admin',
    permissions: ['all'] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const org = {
      ...formData,
      ...(initialData ? { id: initialData.id } : {})
    };
    
    const admin = createAdmin ? adminData : undefined;
    onSubmit(org, admin);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-8">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-gray-900">
            {initialData ? 'Edit Organization' : 'Add New Organization'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {initialData ? 'Update organization information' : 'Fill in the details to add a new organization'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Organization Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Head Office"
            />
          </div>

          {/* Organization Code */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Organization Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., HO-001"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., 123 Main Street, Colombo 01"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., contact@organization.lk"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., +94 11 234 5678"
            />
          </div>

          {/* Create Admin Option */}
          {!initialData && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="createAdmin"
                  checked={createAdmin}
                  onChange={(e) => setCreateAdmin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="createAdmin" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <UserPlus className="w-4 h-4" />
                  Create organization admin
                </label>
              </div>

              {createAdmin && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm text-gray-900 mb-3">Admin Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Admin Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={adminData.name}
                        onChange={handleAdminChange}
                        required={createAdmin}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="e.g., John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Admin Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={adminData.email}
                        onChange={handleAdminChange}
                        required={createAdmin}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="e.g., admin@organization.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        name="role"
                        value={adminData.role}
                        onChange={handleAdminChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="admin">Admin</option>
                        <option value="sub-admin">Sub Admin</option>
                      </select>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    The admin will be created with full permissions and can manage this organization.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Organization' : 'Add Organization'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}