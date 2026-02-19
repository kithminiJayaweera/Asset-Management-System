'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, Loader, Package, FileText } from 'lucide-react';

interface CreateAssetRequestProps {
  userId: string;
  organizationId: string;
  onSuccess?: () => void;
}

const REQUEST_TYPES = [
  { value: 'assignment', label: 'Assignment', description: 'Request a new asset to be assigned to you' },
  { value: 'return', label: 'Return', description: 'Request to return an asset you currently have' },
  { value: 'maintenance', label: 'Maintenance', description: 'Request repair or maintenance of an asset' },
  { value: 'new', label: 'New Procurement', description: 'Request a new type of asset to be purchased' },
];

const ASSET_CATEGORIES = [
  'Laptop',
  'Monitor',
  'Mouse/Keyboard',
  'Office Furniture',
  'Printer',
  'Camera',
  'Phone',
  'Tablet',
  'Server',
  'Network Device',
  'Software License',
  'Other',
];

export function CreateAssetRequest({ userId, organizationId, onSuccess }: CreateAssetRequestProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    requestType: 'assignment',
    assetCategory: '',
    assetName: '',
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedBy: userId,
          organizationId,
          ...formData,
          status: 'pending',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create request');
      }

      setSuccess(true);
      setFormData({ requestType: 'assignment', assetCategory: '', assetName: '', reason: '' });
      
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-linear-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-green-100 rounded-full">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="text-green-900 font-semibold">Request submitted successfully!</p>
          <p className="text-green-700 text-sm">Your asset request is now pending admin review</p>
        </div>
      </div>
    );
  }

  const currentRequestType = REQUEST_TYPES.find(rt => rt.value === formData.requestType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Form Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Asset Request</h2>
          <p className="text-gray-600 text-sm mt-1">Submit a request for asset assignment, return, or maintenance</p>
        </div>
      </div>

      {/* Request Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Request Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REQUEST_TYPES.map((type) => (
            <label key={type.value} className="relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50" style={{
              borderColor: formData.requestType === type.value ? '#3B82F6' : '#E5E7EB',
              backgroundColor: formData.requestType === type.value ? '#EFF6FF' : '#FFFFFF'
            }}>
              <input
                type="radio"
                name="requestType"
                value={type.value}
                checked={formData.requestType === type.value}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-blue-600 cursor-pointer"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-900">{type.label}</p>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Asset Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Asset Category *</label>
        <select
          name="assetCategory"
          value={formData.assetCategory}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        >
          <option value="">Select an asset category...</option>
          {ASSET_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Choose the category that best matches what you need</p>
      </div>

      {/* Asset Name/Model */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Asset Name/Model (Optional)</label>
        <Input
          type="text"
          name="assetName"
          placeholder="e.g., Dell XPS 15, Samsung Monitor 27 inch, MacBook Pro 14 inch"
          value={formData.assetName}
          onChange={handleChange}
          className="border-gray-300 bg-white text-gray-900"
        />
        <p className="text-xs text-gray-500 mt-1">Specify a particular model or brand you're requesting (optional)</p>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Reason *</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            name="reason"
            placeholder="Explain why you need this asset and how it will help you..."
            value={formData.reason}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white resize-none"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Provide clear details about your requirement</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-semibold text-sm">Error submitting request</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold text-base rounded-lg transition-all"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Submitting your request...
          </>
        ) : (
          <>
            <Package className="w-4 h-4 mr-2" />
            Submit Asset Request
          </>
        )}
      </Button>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Note:</span> Your request will be reviewed by the admin team. You'll receive a notification once your request is approved or rejected.
        </p>
      </div>
    </form>
  );
}
