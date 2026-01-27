import { useState } from 'react';
import { Employee, Organization } from '../page';
import { Save, X } from 'lucide-react';

interface EmployeeFormProps {
  onSubmit: (employee: Partial<Employee>) => void;
  initialData?: Employee | null;
  onCancel: () => void;
  organizations: Organization[];
}

export function EmployeeForm({ onSubmit, initialData, onCancel, organizations }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    employeeId: initialData?.employeeId || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    organizationId: initialData?.organizationId || '',
    joinDate: initialData?.joinDate || '',
    salary: initialData?.salary?.toString() || '',
    status: initialData?.status || 'active',
    address: initialData?.address || '',
    emergencyContact: initialData?.emergencyContact || '',
    emergencyContactPhone: initialData?.emergencyContactPhone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = {
      ...formData,
      salary: parseFloat(formData.salary),
      ...(initialData ? { id: initialData.id } : {})
    };
    onSubmit(employee);
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
            {initialData ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {initialData ? 'Update employee information' : 'Fill in the details to add a new employee'}
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
          {/* Personal Information */}
          <div>
            <h3 className="text-lg text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., EMP-001"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., +94 71 234 5678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 123 Main Street, Colombo"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., IT, HR, Finance"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Organization *
                </label>
                <select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Join Date *
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Salary (Monthly) *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50000"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., +94 77 234 5678"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}