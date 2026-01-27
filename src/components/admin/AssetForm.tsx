import { useState } from 'react';
import { Asset, Organization } from '../../page';
import { Save, X } from 'lucide-react';

interface AssetFormProps {
  onSubmit: (asset: any) => void;
  initialData?: Asset | null;
  onCancel: () => void;
  organizations: Organization[];
}

export function AssetForm({ onSubmit, initialData, onCancel, organizations }: AssetFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    status: initialData?.status || 'active',
    location: initialData?.location || '',
    purchaseDate: initialData?.purchaseDate || '',
    value: initialData?.value?.toString() || '',
    depreciationRate: initialData?.depreciationRate?.toString() || '',
    assignedTo: initialData?.assignedTo || '',
    description: initialData?.description || '',
    organizationId: initialData?.organizationId || '',
    // PC/Laptop Specifications
    brand: initialData?.['brand'] || '',
    model: initialData?.['model'] || '',
    serialNumber: initialData?.['serialNumber'] || '',
    processor: initialData?.['processor'] || '',
    ram: initialData?.['ram'] || '',
    storage: initialData?.['storage'] || '',
    operatingSystem: initialData?.['operatingSystem'] || '',
    macAddress: initialData?.['macAddress'] || '',
    warrantyEndDate: initialData?.['warrantyEndDate'] || '',
    // Furniture Specifications
    material: initialData?.['material'] || '',
    color: initialData?.['color'] || '',
    dimensions: initialData?.['dimensions'] || '',
    // Vehicle Specifications
    vehicleType: initialData?.['vehicleType'] || '',
    registrationNumber: initialData?.['registrationNumber'] || '',
    fuelType: initialData?.['fuelType'] || '',
    mileage: initialData?.['mileage'] || '',
    // Common Specs
    condition: initialData?.['condition'] || 'Good',
    lastMaintenanceDate: initialData?.['lastMaintenanceDate'] || ''
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
              <option value="">-- Select Category --</option>
              <option value="PC/Laptop">PC / Laptop</option>
              <option value="Office Furniture">Office Furniture</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Servers">Servers</option>
              <option value="Networking Equipment">Networking Equipment</option>
              <option value="Office Equipment">Office Equipment</option>
              <option value="Machinery">Machinery & Equipment</option>
              <option value="Other">Other</option>
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
              Value (LKR) *
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
              placeholder="e.g., 1500"
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

          {/* PC/LAPTOP SPECIFICATIONS */}
          {formData.category === 'PC/Laptop' && (
            <div className="border-2 border-blue-200 rounded-lg p-5 bg-blue-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">💻</span>
                PC / LAPTOP SPECIFICATIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., Dell, HP, Lenovo" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Model</label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., XPS 15, ProBook 450" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Serial Number</label>
                  <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., SN-2024-001" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Processor (CPU)</label>
                  <input type="text" name="processor" value={formData.processor} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., Intel i7-13700H" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">RAM (GB)</label>
                  <input type="text" name="ram" value={formData.ram} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., 16GB DDR5" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Storage</label>
                  <input type="text" name="storage" value={formData.storage} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., SSD 512GB NVMe" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Operating System</label>
                  <input type="text" name="operatingSystem" value={formData.operatingSystem} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., Windows 11 Pro, Ubuntu 22.04" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">MAC Address</label>
                  <input type="text" name="macAddress" value={formData.macAddress} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g., 00:1A:2B:3C:4D:5E" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Warranty End Date</label>
                  <input type="date" name="warrantyEndDate" value={formData.warrantyEndDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
              </div>
            </div>
          )}

          {/* OFFICE FURNITURE SPECIFICATIONS */}
          {formData.category === 'Office Furniture' && (
            <div className="border-2 border-green-200 rounded-lg p-5 bg-green-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">🪑</span>
                FURNITURE DETAILS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Material</label>
                  <input type="text" name="material" value={formData.material} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" placeholder="e.g., Leather, Fabric, Wood" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" placeholder="e.g., Black, Grey" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">Dimensions</label>
                  <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900" placeholder="e.g., 120cm x 60cm x 75cm (L x W x H)" />
                </div>
              </div>
            </div>
          )}

          {/* VEHICLE SPECIFICATIONS */}
          {formData.category === 'Vehicle' && (
            <div className="border-2 border-amber-200 rounded-lg p-5 bg-amber-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs">🚗</span>
                VEHICLE DETAILS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Vehicle Type</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900">
                    <option value="">Select Type</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Motorcycle">Motorcycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Registration Number</label>
                  <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900" placeholder="e.g., ABC-1234" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Fuel Type</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900">
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Mileage (km)</label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900" placeholder="e.g., 45000" />
                </div>
              </div>
            </div>
          )}

          {/* COMMON MAINTENANCE SECTION */}
          <div className="border-2 border-purple-200 rounded-lg p-5 bg-purple-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">🔧</span>
              MAINTENANCE & CONDITION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Condition</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900">
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Last Maintenance Date</label>
                <input type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900" />
              </div>
            </div>
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