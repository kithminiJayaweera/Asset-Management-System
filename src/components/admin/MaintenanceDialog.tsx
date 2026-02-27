'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Asset } from '@/types/shared';

interface MaintenanceDialogProps {
  asset: Asset;
  onClose: () => void;
  onSubmit: (data: MaintenanceFormData) => Promise<void>;
}

export interface MaintenanceFormData {
  assetId: string;
  issueTitle: string;
  issueDescription: string;
  maintenanceType: 'preventive' | 'corrective' | 'warranty';
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedReturnDate?: string;
  assignedVendor?: string;
  estimatedCost?: number;
  attachments?: File[];
  notes?: string;
}

export function MaintenanceDialog({ asset, onClose, onSubmit }: MaintenanceDialogProps) {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    assetId: asset.id,
    issueTitle: '',
    issueDescription: '',
    maintenanceType: 'corrective',
    priority: 'medium',
    expectedReturnDate: '',
    assignedVendor: '',
    estimatedCost: undefined,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...formData, attachments: files });
      onClose();
    } catch (error) {
      console.error('Failed to submit maintenance request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">Send Asset to Maintenance</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">Asset: <span className="font-semibold text-black">{asset.name}</span></p>
            <p className="text-sm text-gray-600">Location: <span className="font-semibold text-black">{asset.location}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Screen not working"
              value={formData.issueTitle}
              onChange={(e) => setFormData({ ...formData, issueTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the problem in detail..."
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Maintenance Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.maintenanceType}
                onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="warranty">Warranty Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Expected Return Date
            </label>
            <input
              type="date"
              value={formData.expectedReturnDate}
              onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Assigned Repair Vendor / Technician
            </label>
            <select
              value={formData.assignedVendor}
              onChange={(e) => setFormData({ ...formData, assignedVendor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            >
              <option value="">Select vendor...</option>
              <option value="Internal IT Staff">Internal IT Staff</option>
              <option value="External Service Center">External Service Center</option>
              <option value="Manufacturer Service">Manufacturer Service</option>
              <option value="Third-party Technician">Third-party Technician</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Estimated Cost
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.estimatedCost || ''}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Attachments
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-800 hover:file:bg-red-100"
            />
            <p className="text-xs text-gray-500 mt-1">Upload photos, invoices, or warranty documents</p>
            {files.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {files.length} file(s) selected
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Additional Notes
            </label>
            <textarea
              rows={3}
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send to Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
