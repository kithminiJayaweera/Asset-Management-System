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

const categoryFields = {
  'PC/Laptop': [
    { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Dell, HP, Lenovo' },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Latitude 5540' },
    { name: 'processor', label: 'Processor', type: 'text', placeholder: 'e.g., Intel Core i7' },
    { name: 'ram', label: 'RAM', type: 'text', placeholder: 'e.g., 16GB DDR4' },
    { name: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g., 512GB SSD' },
    { name: 'operatingSystem', label: 'Operating System', type: 'text', placeholder: 'e.g., Windows 11' },
  ],
  'Office Furniture': [
    { name: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Wood, Metal, Plastic' },
    { name: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Black, White, Brown' },
    { name: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'e.g., 120x60x75 cm' },
    { name: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g., 25 kg' },
    { name: 'lastMaintenanceDate', label: 'Last Maintenance Date', type: 'date', placeholder: '' },
  ],
  'Vehicle': [
    { name: 'vehicleType', label: 'Vehicle Type', type: 'text', placeholder: 'e.g., Car, Van, Truck' },
    { name: 'registrationNumber', label: 'Registration Number', type: 'text', placeholder: 'e.g., WP-ABC-1234' },
    { name: 'fuelType', label: 'Fuel Type', type: 'text', placeholder: 'e.g., Petrol, Diesel, Electric' },
    { name: 'engineCapacity', label: 'Engine Capacity', type: 'text', placeholder: 'e.g., 1500cc' },
    { name: 'mileage', label: 'Mileage', type: 'text', placeholder: 'e.g., 45000 km' },
  ],
  'Electronics': [
    { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Samsung, Sony, LG' },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Galaxy S21' },
    { name: 'powerRating', label: 'Power Rating', type: 'text', placeholder: 'e.g., 100W' },
    { name: 'voltage', label: 'Voltage', type: 'text', placeholder: 'e.g., 220V' },
  ],
};

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
    // Category-specific fields
    details: {} as Record<string, any>,
    // Maintenance fields
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
    
    console.log('FINAL PAYLOAD:', JSON.stringify(asset, null, 2));
    console.log('Details being sent:', asset.details);
    onSubmit(asset);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear details when category changes
    if (name === 'category') {
      const defaultRates = {
        'PC/Laptop': '20',
        'Office Furniture': '10',
        'Vehicle': '15',
        'Electronics': '15'
      };
      
      setFormData(prev => ({
        ...prev,
        category: value,
        depreciationRate: defaultRates[value as keyof typeof defaultRates] || '10',
        details: {} // Clear details, not specifications
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDetailChange = (fieldName: string, value: string) => {
    console.log(`Detail change: ${fieldName} = ${value}`);
    const newDetails = {
      ...formData.details,
      [fieldName]: value
    };
    console.log('Updated details:', newDetails);
    setFormData({
      ...formData,
      details: newDetails
    });
  };

  const getCurrentCategoryFields = () => {
    return categoryFields[formData.category as keyof typeof categoryFields] || [];
  };

  return (
    <div className="p-8">
      {/* Header with Close Button */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Dell Laptop XPS 15"
            />
          </div>

          {/* Category */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select an organization</option>
              {organizations.map((org, idx) => (
                <option key={org.id || `org-${idx}`} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., SN-2024-001"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {/* Warranty End Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Warranty End Date
            </label>
            <input
              type="date"
              name="warrantyEndDate"
              value={formData.warrantyEndDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Maintenance Condition */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Maintenance Condition
            </label>
            <select
              name="maintenanceCondition"
              value={formData.maintenanceCondition}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {/* Last Maintenance Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Last Maintenance Date
            </label>
            <input
              type="date"
              name="lastMaintenanceDate"
              value={formData.lastMaintenanceDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Category-Specific Details */}
          {getCurrentCategoryFields().length > 0 && (
            <div className="border-t pt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-black mb-4">
                {formData.category} Details
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Fill in the category-specific information below:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCurrentCategoryFields().map((field, idx) => (
                  <div key={field.name || `field-${idx}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} *
                    </label>
                    <input
                      type={field.type}
                      value={formData.details?.[field.name] || ''}
                      onChange={(e) => {
                        console.log(`Field ${field.name} changed to: ${e.target.value}`);
                        handleDetailChange(field.name, e.target.value);
                      }}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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






