import { useState } from 'react';
import { Asset, Organization } from '../page';
import { Search, Filter, Edit2, Trash2, Plus, Package, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface AssetListProps {
  assets: Asset[];
  organizations: Organization[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (asset: Asset) => void;
}

export function AssetList({ assets, organizations, onEdit, onDelete, onAddNew, onViewDetails }: AssetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const categories = ['all', ...Array.from(new Set(assets.map(a => a.category)))];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrganizationName = (orgId?: string) => {
    if (!orgId) return null;
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : null;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">Asset Management</h2>
          <p className="text-gray-600">Manage and track all your assets</p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Asset Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Category</TableHead>
              <TableHead className="font-semibold text-gray-900">Location</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Purchase Date</TableHead>
              <TableHead className="font-semibold text-gray-900">Value</TableHead>
              <TableHead className="font-semibold text-gray-900">Assigned To</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map(asset => (
              <TableRow 
                key={asset.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewDetails(asset)}
              >
                <TableCell className="font-medium text-gray-900">{asset.name}</TableCell>
                <TableCell className="text-gray-600">{asset.category}</TableCell>
                <TableCell className="text-gray-600">{asset.location}</TableCell>
                <TableCell>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">{new Date(asset.purchaseDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-gray-600">₨{asset.value.toLocaleString()}</TableCell>
                <TableCell className="text-gray-600">{asset.assignedTo || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewDetails(asset)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(asset)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${asset.name}?`)) {
                          onDelete(asset.id);
                        }
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No assets found</p>
        </div>
      )}
    </div>
  );
}
