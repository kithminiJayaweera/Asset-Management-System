import { Building2, Edit2, Trash2, Mail, Phone, MapPin, Calendar, Plus } from 'lucide-react';
import { Organization } from '@/types/shared';
import { useState } from 'react';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface OrganizationListProps {
  organizations: Organization[];
  onEdit: (org: Organization) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (org: Organization) => void;
}

export function OrganizationList({ organizations, onEdit, onDelete, onAddNew, onViewDetails }: OrganizationListProps) {
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null);
  
  return (
    <div className='bg-[#EFEFEF]'>
      <div className="mb-8 flex items-center justify-between ml-5">
        <div>
          <h2 className="text-2xl text-black mb-2 mt-5 ">Organizations</h2>
          <p className="text-gray-800">Manage your organization branches and locations</p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Organization
        </button>
      </div>

      {/* Organization Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {organizations.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-800">No organizations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contact Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {organizations.map(org => (
                  <tr 
                    key={org.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onViewDetails(org)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <Building2 className="w-4 h-4 text-red-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-black">{org.name}</div>
                          <div className="text-xs text-gray-700">{org.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-gray-700 max-w-xs">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                        <span className="line-clamp-2">{org.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-gray-700" />
                        {org.contactEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-700" />
                        {org.contactPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-700" />
                        {new Date(org.createdDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(org);
                          }}
                          className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit Organization"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteOrg(org);
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Organization"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteOrg}
        title="Delete Organization"
        message={`Are you sure you want to delete ${deleteOrg?.name}? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteOrg) {
            onDelete(deleteOrg.id);
            setDeleteOrg(null);
          }
        }}
        onCancel={() => setDeleteOrg(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}






