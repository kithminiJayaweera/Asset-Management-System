import { useState } from 'react';
import { Save, Package } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
}

interface AssetRequestFormProps {
  employee: Employee;
}

export function AssetRequestForm({ employee }: AssetRequestFormProps) {
  const [formData, setFormData] = useState({
    assetName: '',
    category: '',
    quantity: 1,
    reason: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Asset request submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        assetName: '',
        category: '',
        quantity: 1,
        reason: '',
        priority: 'medium'
      });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) : value
    });
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="p-6 bg-green-50 rounded-lg border border-green-200 inline-block">
          <Package className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg text-green-900 mb-2">Request Submitted!</h3>
          <p className="text-green-700">Your asset request has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900 mb-2">Request Asset</h2>
        <p className="text-gray-600">Submit a request for new assets</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Asset Name *
              </label>
              <input
                type="text"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="PC/Laptop">PC / Laptop</option>
                <option value="Office Furniture">Office Furniture</option>
                <option value="Office Equipment">Office Equipment</option>
                <option value="Networking Equipment">Networking Equipment</option>
                <option value="Servers">Servers</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Machinery">Machinery & Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Priority *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Reason for Request *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please explain why you need this asset..."
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}