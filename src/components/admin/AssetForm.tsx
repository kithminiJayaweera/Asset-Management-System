/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Asset, Organization } from '@/types/shared';

interface AssetFormProps {
  onSubmit: (asset: any) => void;
  initialData?: Asset | null;
  onCancel: () => void;
  organizations: Organization[];
}

export function AssetForm({ onSubmit, initialData, onCancel, organizations }: AssetFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'PC/Laptop',
    status: initialData?.status || 'active',
    location: initialData?.location || '',
    purchaseDate: initialData?.purchaseDate || '',
    value: initialData?.value?.toString() || '',
    depreciationRate: initialData?.depreciationRate?.toString() || '20',
    assignedTo: initialData?.assignedTo || '',
    description: initialData?.description || '',
    organizationId: initialData?.organizationId || '',
    serialNumber: initialData?.serialNumber || '',
    condition: initialData?.condition || 'good',
    warrantyEndDate: initialData?.warrantyEndDate || '',
    details: {} as Record<string, any>,
    maintenanceCondition: 'good',
    lastMaintenanceDate: initialData?.lastMaintenanceDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const asset = {
      ...formData,
      value: parseFloat(formData.value),
      depreciationRate: formData.depreciationRate ? parseFloat(formData.depreciationRate) : 10,
      details: formData.details,
      maintenance: {
        condition: formData.maintenanceCondition,
        lastMaintenanceDate: formData.lastMaintenanceDate || null
      },
      ...(initialData ? { id: initialData.id, logs: initialData.logs } : {})
    };
    
    onSubmit(asset);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-black">
            {initialData ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            {initialData ? 'Update asset information' : 'Fill in the details to add a new asset'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Asset Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Dell Laptop XPS 15"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="PC/Laptop">PC/Laptop</option>
              <option value="Office Furniture">Office Furniture</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Office - Floor 2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Value (Rs.) *
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., 150000"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Annual Depreciation Rate (%) *
            </label>
            <input
              type="number"
              name="depreciationRate"
              value={formData.depreciationRate}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., 20"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Assigned To (Optional)
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Additional notes about the asset..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Organization (Optional)
            </label>
            <select
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select an organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
