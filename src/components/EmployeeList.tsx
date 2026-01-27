import { Employee, Organization } from '../page';
import { User, Mail, Phone, Building2, Calendar, Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface EmployeeListProps {
  employees: Employee[];
  organizations: Organization[];
  onViewDetails: (employee: Employee) => void;
}

export function EmployeeList({ employees, organizations, onViewDetails }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const departments = ['all', ...Array.from(new Set(employees.map(e => e.department)))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrganization = filterOrganization === 'all' || employee.organizationId === filterOrganization;
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    return matchesSearch && matchesOrganization && matchesDepartment;
  });

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900 mb-2">Employee List</h2>
        <p className="text-gray-600">View and assign employees</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Organization Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterOrganization}
              onChange={(e) => setFilterOrganization(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Departments</option>
              {departments.filter(d => d !== 'all').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEmployees.map(employee => (
          <div key={employee.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">{employee.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{employee.position}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
                    {employee.status === 'active' ? 'Active' : employee.status === 'on-leave' ? 'On Leave' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onViewDetails(employee)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-3 py-1 bg-gray-100 rounded text-xs">ID: {employee.employeeId}</span>
                <span className="px-3 py-1 bg-gray-100 rounded text-xs">{employee.department}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{employee.email}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{employee.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{getOrganizationName(employee.organizationId)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined: {new Date(employee.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No employees found</p>
        </div>
      )}
    </div>
  );
}