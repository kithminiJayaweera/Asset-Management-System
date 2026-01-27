import { useState } from 'react';
import { Asset, Organization } from '../page';
import { Save, X } from 'lucide-react';

interface AssetFormProps {
  onSubmit: (asset: any) => void;
  initialData?: Asset | null;
  onCancel: () => void;
  organizations: Organization[];
}

export function AssetForm({ onSubmit, initialData, onCancel, organizations }: AssetFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || 'Dell Latitude 5000',
    category: initialData?.category || 'PC/Laptop',
    status: initialData?.status || 'active',
    location: initialData?.location || 'Office - Floor 2',
    purchaseDate: initialData?.purchaseDate || '2024-01-15',
    value: initialData?.value?.toString() || '150000',
    depreciationRate: initialData?.depreciationRate?.toString() || '20',
    assignedTo: initialData?.assignedTo || 'John Doe',
    description: initialData?.description || 'Business laptop for development',
    organizationId: initialData?.organizationId || '',
    // PC/Laptop Specifications
    brand: initialData?.brand || 'Dell',
    model: initialData?.model || 'Latitude 5000',
    serialNumber: initialData?.serialNumber || 'SN-2024-00145',
    processor: initialData?.processor || 'Intel Core i7-13700H',
    ram: initialData?.ram || '16GB DDR5',
    storage: initialData?.storage || 'SSD 512GB NVMe',
    operatingSystem: initialData?.operatingSystem || 'Windows 11 Pro',
    macAddress: initialData?.macAddress || '00:1A:2B:3C:4D:5E',
    warrantyEndDate: initialData?.warrantyEndDate || '2025-01-15',
    // Furniture Specifications
    material: initialData?.material || 'Leather',
    color: initialData?.color || 'Black',
    dimensions: initialData?.dimensions || '120cm x 60cm x 75cm (L x W x H)',
    // Vehicle Specifications
    vehicleType: initialData?.vehicleType || 'Car',
    registrationNumber: initialData?.registrationNumber || 'WP-ABC-1234',
    fuelType: initialData?.fuelType || 'Diesel',
    mileage: initialData?.mileage || '45000',
    // Common Specs
    condition: initialData?.condition || 'Good',
    lastMaintenanceDate: initialData?.lastMaintenanceDate || '2025-12-15'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = {
      ...formData,
      value: parseFloat(formData.value),
      depreciationRate: formData.depreciationRate ? parseFloat(formData.depreciationRate) : 10,
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
      {/* Header with Close Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-gray-900">
            {initialData ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {initialData ? 'Update asset information' : 'Fill in the details to add a new asset'}
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
          {/* Asset Name */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Dell Laptop XPS 15"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Electronics, Furniture"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Location */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Office - Floor 2"
            />
          </div>

          {/* Purchase Date */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Value */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 150000"
            />
          </div>

          {/* Depreciation Rate */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 20"
            />
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-900 font-semibold mb-2">Recommended Rates (Sri Lanka):</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Computer/Laptop:</strong> 20-33%</li>
                <li>• <strong>Servers:</strong> 20%</li>
                <li>• <strong>Office Furniture:</strong> 10%</li>
                <li>• <strong>Vehicles:</strong> 15-20%</li>
                <li>• <strong>Machinery/Equipment:</strong> 10-15%</li>
                <li>• <strong>Software:</strong> 20-25%</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                <strong>Example:</strong> If asset costs ₨150,000 at 20% rate: Annual depreciation = ₨30,000
              </p>
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Assigned To (Optional)
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about the asset..."
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Organization (Optional)
            </label>
            <select
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
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