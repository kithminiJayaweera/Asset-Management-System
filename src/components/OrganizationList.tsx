import { Organization } from '../page';
import { Building2, Edit2, Trash2, Mail, Phone, MapPin, Calendar, Plus } from 'lucide-react';

interface OrganizationListProps {
  organizations: Organization[];
  onEdit: (org: Organization) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (org: Organization) => void;
}

export function OrganizationList({ organizations, onEdit, onDelete, onAddNew, onViewDetails }: OrganizationListProps) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Organizations</h2>
          <p className="text-gray-600">Manage your organization branches and locations</p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Organization
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {organizations.map(org => (
          <div 
            key={org.id} 
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onViewDetails(org)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900">{org.name}</h3>
                    <span className="text-sm text-gray-600">{org.code}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(org);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${org.name}?`)) {
                        onDelete(org.id);
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span className="text-sm">{org.address}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{org.contactEmail}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{org.contactPhone}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Created: {new Date(org.createdDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-blue-600">Click to view details and manage admins →</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No organizations found</p>
        </div>
      )}
    </div>
  );
}