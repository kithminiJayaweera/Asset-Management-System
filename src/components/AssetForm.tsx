/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Save, X, Search, AlertCircle } from 'lucide-react';
import { Asset, Organization } from '@/types/shared';
import { detectAsset, validateUniqueSerial } from '@/utils/assetDetection';
import { calculateCurrentValue, getDefaultUsefulLife } from '@/utils/depreciation';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [calculatedCurrentValue, setCalculatedCurrentValue] = useState<number | null>(null);
  const [serialValidation, setSerialValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  
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
    // Category-specific fields - populate from initialData.details
    details: (initialData?.details || {}) as Record<string, any>,
    // Maintenance fields
    maintenanceCondition: initialData?.maintenance?.condition || 'good',
    lastMaintenanceDate: initialData?.maintenance?.lastMaintenanceDate || initialData?.lastMaintenanceDate || '',
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      // Helper to format date for input field
      const formatDate = (date: string | undefined) => {
        if (!date) return '';
        try {
          return new Date(date).toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'PC/Laptop',
        status: initialData.status || 'active',
        location: initialData.location || '',
        purchaseDate: formatDate(initialData.purchaseDate),
        value: initialData.value?.toString() || '',
        depreciationRate: initialData.depreciationRate?.toString() || '20',
        assignedTo: initialData.assignedTo || '',
        description: initialData.description || '',
        organizationId: initialData.organizationId || '',
        serialNumber: initialData.serialNumber || '',
        condition: initialData.condition || 'good',
        warrantyEndDate: formatDate(initialData.warrantyEndDate),
        details: (initialData.details || {}) as Record<string, any>,
        maintenanceCondition: initialData.maintenance?.condition || 'good',
        lastMaintenanceDate: formatDate(initialData.maintenance?.lastMaintenanceDate || initialData.lastMaintenanceDate),
      });
    }
  }, [initialData]);

  // Calculate current value in real-time
  useEffect(() => {
    if (formData.value && formData.purchaseDate && formData.category) {
      const purchasePrice = parseFloat(formData.value);
      const purchaseDate = new Date(formData.purchaseDate);
      
      if (!isNaN(purchasePrice) && purchasePrice > 0 && !isNaN(purchaseDate.getTime())) {
        const usefulLife = getDefaultUsefulLife(formData.category);
        const currentValue = calculateCurrentValue(
          purchasePrice,
          purchaseDate,
          formData.category,
          usefulLife
        );
        setCalculatedCurrentValue(currentValue);
      } else {
        setCalculatedCurrentValue(null);
      }
    } else {
      setCalculatedCurrentValue(null);
    }
  }, [formData.value, formData.purchaseDate, formData.category]);

  // Validate serial number uniqueness
  useEffect(() => {
    const validateSerial = async () => {
      if (formData.serialNumber && formData.serialNumber.length >= 3) {
        const result = await validateUniqueSerial(formData.serialNumber, initialData?.id);
        if (!result.isUnique) {
          setSerialValidation({
            isValid: false,
            message: `Serial number already exists (${result.existingAsset?.name})`
          });
        } else {
          setSerialValidation({ isValid: true, message: 'Serial number is unique' });
        }
      } else {
        setSerialValidation({ isValid: true, message: '' });
      }
    };

    const timeoutId = setTimeout(validateSerial, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.serialNumber, initialData?.id]);

  // Handle asset detection search
  const handleAssetSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchMessage('Please enter a serial number or model to search');
      return;
    }

    setSearching(true);
    setSearchMessage('🔍 Searching database and AI for product info...');

    try {
      const result = await detectAsset({
        serialNumber: searchQuery,
        model: searchQuery,
      });

      setSearchMessage(result.message);

      // Handle database match
      if (result.found && result.asset && result.source === 'database') {
        setFormData(prev => ({
          ...prev,
          name: result.asset?.name || prev.name,
          category: result.asset?.category || prev.category,
          serialNumber: result.asset?.serialNumber || prev.serialNumber,
          value: result.asset?.purchasePrice?.toString() || prev.value,
          purchaseDate: result.asset?.purchaseDate 
            ? new Date(result.asset.purchaseDate).toISOString().split('T')[0] 
            : prev.purchaseDate,
        }));
      }
      
      // Handle AI-detected product info
      if (result.found && result.aiInfo && result.source === 'ai') {
        const aiInfo = result.aiInfo;
        
        // Convert USD to LKR (approximate rate)
        const estimatedPriceLKR = aiInfo.estimatedPrice ? Math.round(aiInfo.estimatedPrice * 300) : 0;
        
        console.log('AI specs received:', aiInfo.specs);
        
        setFormData(prev => ({
          ...prev,
          name: aiInfo.manufacturer && aiInfo.model ? `${aiInfo.manufacturer} ${aiInfo.model}` : prev.name,
          category: aiInfo.category || prev.category,
          description: aiInfo.description || prev.description,
          value: estimatedPriceLKR > 0 ? estimatedPriceLKR.toString() : prev.value,
          depreciationRate: aiInfo.depreciationRate?.toString() || prev.depreciationRate,
          // Populate details with specs - ensure it's a new object to trigger re-render
          details: aiInfo.specs ? { ...aiInfo.specs } : prev.details,
        }));
        
        console.log('Form data updated with AI info');
        
        const priceText = estimatedPriceLKR > 0 
          ? `Est. Price: Rs. ${estimatedPriceLKR.toLocaleString()}` 
          : 'Price not available';
        
        setSearchMessage(
          `✅ Information found: ${aiInfo.manufacturer || ''} ${aiInfo.model || ''}\n` +
          `Category: ${aiInfo.category || 'Unknown'} | ${priceText}\n` +
          `${aiInfo.description || ''}\n` +
          `✨ Category-specific fields have been auto-filled below!`
        );
      }
    } catch (error) {
      setSearchMessage('Error searching for assets');
    } finally {
      setSearching(false);
    }
  };

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

      {/* Asset Detection Search */}
      {!initialData && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-400 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Quick Asset Detection
          </h3>
          <p className="text-xs text-purple-600 mb-3">
            Search for existing assets by serial number or model to auto-fill details
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAssetSearch()}
              placeholder="Enter serial number or model (e.g., AST-001 or Latitude 5520)"
              className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
            />
            <button
              type="button"
              onClick={handleAssetSearch}
              disabled={searching}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 text-sm"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {searchMessage && (
            <p className="mt-2 text-xs text-blue-800">{searchMessage}</p>
          )}
        </div>
      )}

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              placeholder="e.g., 150000"
            />
          </div>

          {/* Real-time Depreciation Preview */}
          {calculatedCurrentValue !== null && (
            <div className="col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-900 mb-2">
                💰 Estimated Current Value (Auto-calculated)
              </h4>
              <p className="text-2xl font-bold text-green-700 mb-2">
                Rs. {calculatedCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-800">
                Based on {formData.category} depreciation rate and time since purchase.
                This value will be automatically updated when you save the asset.
              </p>
            </div>
          )}

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              placeholder="e.g., 20"
            />
            <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-blue-900 font-semibold mb-2">Recommended Rates (Sri Lanka):</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Computer/Laptop:</strong> 20-33%</li>
                <li>• <strong>Servers:</strong> 20%</li>
                <li>• <strong>Office Furniture:</strong> 10%</li>
                <li>• <strong>Vehicles:</strong> 15-20%</li>
                <li>• <strong>Machinery/Equipment:</strong> 10-15%</li>
                <li>• <strong>Software:</strong> 20-25%</li>
              </ul>
              <p className="text-xs text-purple-700 mt-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="">Select an organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
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
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                !serialValidation.isValid 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder="e.g., SN-2024-001"
            />
            {serialValidation.message && (
              <p className={`mt-1 text-xs flex items-center gap-1 ${
                serialValidation.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {!serialValidation.isValid && <AlertCircle className="w-3 h-3" />}
                {serialValidation.message}
              </p>
            )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
                {getCurrentCategoryFields().map((field) => (
                  <div key={field.name}>
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
                      className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
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
              className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-black rounded-lg hover:bg-purple-400 transition-colors"
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






