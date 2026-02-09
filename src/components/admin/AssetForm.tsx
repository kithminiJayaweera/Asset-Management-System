/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Save, X, ChevronDown } from 'lucide-react';
import { IOrganization } from '@/types';

interface AssetFormProps {
  onSubmit: (asset: any) => void;
  initialData?: any | null;  // Accepts either IAsset or old Asset interface for backward compat
  onCancel: () => void;
  organizations: IOrganization[] | any[];
}

const categoryFields = {
  'PC/Laptop': [
    { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Dell, HP, Lenovo' },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Latitude 5540' },
    { name: 'serialNumber', label: 'Serial Number', type: 'text', placeholder: 'e.g., SN-2024-001' },
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
    { name: 'serialNumber', label: 'Serial Number', type: 'text', placeholder: 'e.g., SN-2024-001' },
    { name: 'fuelType', label: 'Fuel Type', type: 'text', placeholder: 'e.g., Petrol, Diesel, Electric' },
    { name: 'engineCapacity', label: 'Engine Capacity', type: 'text', placeholder: 'e.g., 1500cc' },
    { name: 'mileage', label: 'Mileage', type: 'text', placeholder: 'e.g., 45000 km' },
  ],
  'Electronics': [
    { name: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Samsung, Sony, LG' },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Galaxy S21' },
    { name: 'serialNumber', label: 'Serial Number', type: 'text', placeholder: 'e.g., SN-2024-001' },
    { name: 'powerRating', label: 'Power Rating', type: 'text', placeholder: 'e.g., 100W' },
    { name: 'voltage', label: 'Voltage', type: 'text', placeholder: 'e.g., 220V' },
  ],
};

export function AssetForm({ onSubmit, initialData, onCancel, organizations }: AssetFormProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    financial: true,
    assignment: false,
    details: true,
    maintenance: false,
  });

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'PC/Laptop',
    status: initialData?.status === 'active' ? 'available' : (initialData?.status || 'available'),
    location: initialData?.location || '',
    purchaseDate: initialData?.purchaseDate ? (typeof initialData.purchaseDate === 'string' ? initialData.purchaseDate : new Date(initialData.purchaseDate).toISOString().split('T')[0]) : '',
    purchasePrice: (initialData?.purchasePrice || initialData?.value)?.toString() || '',
    depreciationMethod: initialData?.depreciationMethod || 'straight-line',
    usefulLife: initialData?.usefulLife?.toString() || '5',
    depreciationRate: initialData?.depreciationRate?.toString() || '20',
    salvageValue: initialData?.salvageValue?.toString() || '0',
    assignedTo: initialData?.assignedTo ? String(initialData.assignedTo) : '',
    description: initialData?.description || '',
    organizationId: initialData?.organizationId ? String(initialData.organizationId) : '',
    condition: initialData?.condition || 'good',
    warrantyEndDate: initialData?.warrantyExpiry || initialData?.warrantyEndDate || '',
    details: initialData?.details || {} as Record<string, any>,
    lastMaintenanceDate: initialData?.maintenance?.lastMaintenanceDate || initialData?.lastMaintenanceDate || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    // Validation
    if (!formData.name.trim()) newErrors.name = 'Asset name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Purchase price is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const asset: any = {
      name: formData.name,
      category: formData.category,
      status: formData.status,
      location: formData.location,
      purchaseDate: formData.purchaseDate,
      purchasePrice: Number(formData.purchasePrice),
      depreciationMethod: formData.depreciationMethod,
      salvageValue: Number(formData.salvageValue) || 0,
      assignedTo: formData.assignedTo || null,
      description: formData.description,
      organizationId: formData.organizationId,
      condition: formData.condition,
      warrantyExpiry: formData.warrantyEndDate || undefined,
      details: formData.details,
      maintenance: {
        lastMaintenanceDate: formData.lastMaintenanceDate || null
      },
    };

    if (formData.depreciationMethod === 'straight-line') {
      asset.usefulLife = Number(formData.usefulLife);
    } else if (formData.depreciationMethod === 'declining-balance') {
      asset.depreciationRate = Number(formData.depreciationRate);
    }

    if (initialData) {
      asset._id = initialData._id || initialData.id;
      asset.logs = initialData.logs;
    }
    
    onSubmit(asset);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    
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
        details: {}
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FormField = ({ name, label, type = 'text', placeholder = '', required = false, value, onChange, helpText }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
          required={required}
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? '0.01' : undefined}
        />
      )}
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  const FormSelect = ({ name, label, options, required = false, value, onChange }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        required={required}
      >
        {options.map((opt: any, idx: number) => (
          <option key={opt.value || `opt-${idx}`} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  const FormSection = ({ title, section, children }: any) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform ${
            expandedSections[section] ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {expandedSections[section] && (
        <div className="px-4 py-4 space-y-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {initialData ? 'Edit Asset' : 'Add New Asset'}
            </h1>
            <p className="text-gray-600 mt-1">
              {initialData ? 'Update the asset information' : 'Create a new asset record'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <FormSection title="Basic Information" section="basic">
            <div className="space-y-4">
              <FormField
                name="name"
                label="Asset Name"
                placeholder="e.g., Dell Laptop XPS 15"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="category"
                  label="Category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  options={[
                    { value: 'PC/Laptop', label: 'PC/Laptop' },
                    { value: 'Office Furniture', label: 'Office Furniture' },
                    { value: 'Vehicle', label: 'Vehicle' },
                    { value: 'Electronics', label: 'Electronics' },
                  ]}
                />
                <FormSelect
                  name="condition"
                  label="Condition"
                  value={formData.condition}
                  onChange={handleChange}
                  options={[
                    { value: 'excellent', label: 'Excellent' },
                    { value: 'good', label: 'Good' },
                    { value: 'fair', label: 'Fair' },
                    { value: 'poor', label: 'Poor' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="status"
                  label="Status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'maintenance', label: 'Maintenance' },
                    { value: 'retired', label: 'Retired' },
                  ]}
                />
                <FormField
                  name="location"
                  label="Location"
                  placeholder="e.g., Office Floor 2"
                  required
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <FormField
                name="purchaseDate"
                label="Purchase Date"
                type="date"
                required
                value={formData.purchaseDate}
                onChange={handleChange}
              />
              <FormField
                name="description"
                label="Description"
                type="textarea"
                placeholder="Additional notes about the asset..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          {/* Financial Information */}
          <FormSection title="Financial Information" section="financial">
            <div className="space-y-4">
              <FormField
                name="purchasePrice"
                label="Purchase Price (Rs.)"
                type="number"
                placeholder="e.g., 150,000"
                required
                value={formData.purchasePrice}
                onChange={handleChange}
              />
              <FormSelect
                name="depreciationMethod"
                label="Depreciation Method"
                required
                value={formData.depreciationMethod}
                onChange={handleChange}
                options={[
                  { value: 'straight-line', label: 'Straight-Line' },
                  { value: 'declining-balance', label: 'Declining Balance' },
                  { value: 'none', label: 'None' },
                ]}
              />
              {formData.depreciationMethod === 'straight-line' && (
                <FormField
                  name="usefulLife"
                  label="Useful Life (Years)"
                  type="number"
                  placeholder="e.g., 5"
                  required
                  value={formData.usefulLife}
                  onChange={handleChange}
                  helpText="Expected lifespan before asset reaches salvage value"
                />
              )}
              {formData.depreciationMethod === 'declining-balance' && (
                <>
                  <FormField
                    name="depreciationRate"
                    label="Annual Depreciation Rate (%)"
                    type="number"
                    placeholder="e.g., 20"
                    required
                    value={formData.depreciationRate}
                    onChange={handleChange}
                    helpText="Percentage of current value lost each year"
                  />
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Recommended Rates</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>Computer/Laptop: 20-33%</li>
                      <li>Servers: 20%</li>
                      <li>Office Furniture: 10%</li>
                      <li>Vehicles: 15-20%</li>
                      <li>Machinery: 10-15%</li>
                    </ul>
                  </div>
                </>
              )}
              <FormField
                name="salvageValue"
                label="Salvage Value (Rs.)"
                type="number"
                placeholder="e.g., 0"
                value={formData.salvageValue}
                onChange={handleChange}
                helpText="Minimum value the asset retains"
              />
            </div>
          </FormSection>

          {/* Assignment */}
          <FormSection title="Assignment & Organization" section="assignment">
            <div className="space-y-4">
              <FormField
                name="assignedTo"
                label="Assigned To"
                placeholder="e.g., John Doe"
                value={formData.assignedTo}
                onChange={handleChange}
              />
              <FormSelect
                name="organizationId"
                label="Organization"
                value={formData.organizationId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select an organization' },
                  ...organizations.map((org, idx) => ({ value: org.id || `org-${idx}`, label: org.name }))
                ]}
              />
            </div>
          </FormSection>

          {/* Category-Specific Details */}
          {getCurrentCategoryFields().length > 0 && (
            <FormSection title="Category Details" section="details">
              <p className="text-sm text-gray-600 mb-4">Specifications for {formData.category}:</p>
              <div className="grid grid-cols-2 gap-4">
                {getCurrentCategoryFields().map((field, idx) => (
                  <div key={field.name || `field-${idx}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={field.type}
                      value={formData.details?.[field.name] || ''}
                      onChange={(e) => {
                        const newDetails = {
                          ...formData.details,
                          [field.name]: e.target.value
                        };
                        setFormData({ ...formData, details: newDetails });
                      }}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}
              </div>
            </FormSection>
          )}

          {/* Maintenance Information */}
          <FormSection title="Maintenance" section="maintenance">
            <div className="space-y-4">
              <FormSelect
                name="condition"
                label="Asset Condition"
                value={formData.condition}
                onChange={handleChange}
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' },
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="lastMaintenanceDate"
                  label="Last Maintenance Date"
                  type="date"
                  value={formData.lastMaintenanceDate}
                  onChange={handleChange}
                />
                <FormField
                  name="warrantyEndDate"
                  label="Warranty End Date"
                  type="date"
                  value={formData.warrantyEndDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white/95 -mx-6 -mb-6 px-6 py-4 border-t">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Asset' : 'Create Asset'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

