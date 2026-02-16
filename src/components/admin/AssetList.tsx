import { useState } from 'react';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Plus,
  Package,
  Eye
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Asset, Organization } from '@/types/shared';

interface AssetListProps {
  assets: Asset[];
  organizations: Organization[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (asset: Asset) => void;
}

export function AssetList({
  assets,
  organizations,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetails
}: AssetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const categories = ['all', ...Array.from(new Set(assets.map(a => a.category)))];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assignedTo &&
        asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      filterCategory === 'all' || asset.category === filterCategory;

    const matchesStatus =
      filterStatus === 'all' || asset.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-gray-200 text-gray-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="text-black bg-white opacity-100">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Asset Management</h2>
          <p className="text-gray-700">Manage and track all your assets</p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-300 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                border border-gray-300 rounded-lg
                bg-white text-black placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Category */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                border border-gray-300 rounded-lg
                bg-white text-black
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="
              w-full px-4 py-2
              border border-gray-300 rounded-lg
              bg-white text-black
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-black font-semibold">Asset Name</TableHead>
              <TableHead className="text-black font-semibold">Category</TableHead>
              <TableHead className="text-black font-semibold">Location</TableHead>
              <TableHead className="text-black font-semibold">Status</TableHead>
              <TableHead className="text-black font-semibold">Assignment</TableHead>
              <TableHead className="text-black font-semibold">Purchase Date</TableHead>
              <TableHead className="text-black font-semibold">Value (LKR)</TableHead>
              <TableHead className="text-black font-semibold">Assigned To</TableHead>
              <TableHead className="text-black font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAssets.map(asset => (
              <TableRow
                key={asset.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewDetails(asset)}
              >
                <TableCell className="font-medium text-black">
                  {asset.name}
                </TableCell>
                <TableCell className="text-black">{asset.category}</TableCell>
                <TableCell className="text-black">{asset.location}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      asset.assignedTo ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {asset.assignedTo ? 'Assigned' : 'Unassigned'}
                  </span>
                </TableCell>
                <TableCell className="text-black">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-black">
                  ₨{asset.value.toLocaleString()}
                </TableCell>
                <TableCell className="text-black">
                  {asset.assignedTo || '-'}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onViewDetails(asset)}
                      className="p-2 text-gray-700 hover:text-green-600 hover:bg-green-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(asset)}
                      className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${asset.name}?`)) {
                          onDelete(asset.id);
                        }
                      }}
                      className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-100 rounded-lg"
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

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-700">No assets found</p>
        </div>
      )}
    </div>
  );
}
