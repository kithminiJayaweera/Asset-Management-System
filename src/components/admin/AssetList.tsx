import { useState } from 'react';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Plus,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  Wrench
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
import { ConfirmDialog } from '../ui/ConfirmDialog';

type AssignmentFilter = 'all' | 'assigned' | 'unassigned';
type StatusFilter = 'all' | 'active' | 'maintenance' | 'retired' | 'lost';
type CategoryFilter = 'all' | string;

interface FilterState {
  search: string;
  category: CategoryFilter;
  assignment: AssignmentFilter;
  status: StatusFilter;
}

interface AssetListProps {
  assets: Asset[];
  organizations: Organization[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onViewDetails: (asset: Asset) => void;
  onSendToMaintenance?: (asset: Asset) => void;
}

export function AssetList({
  assets,
  organizations,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetails,
  onSendToMaintenance
}: AssetListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    assignment: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);

  const categories = ['all', ...Array.from(new Set(assets.map(a => a.category)))];

  const filteredAssets = assets.filter(asset => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchLower) ||
        asset.location.toLowerCase().includes(searchLower) ||
        asset.assignedTo?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category !== 'all' && asset.category !== filters.category) {
      return false;
    }

    // Assignment filter (independent dimension)
    if (filters.assignment !== 'all') {
      const isAssigned = Boolean(asset.assignedTo && asset.assignedTo.trim());
      if (filters.assignment === 'assigned' && !isAssigned) return false;
      if (filters.assignment === 'unassigned' && isAssigned) return false;
    }

    // Status filter (independent dimension)
    if (filters.status !== 'all' && asset.status !== filters.status) {
      return false;
    }

    return true;
  });

  // Pagination logic
  const totalItems = filteredAssets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

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

  const getAssignmentBadge = (assignedTo?: string) => {
    if (assignedTo && assignedTo.trim()) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="text-black opacity-100" style={{ backgroundColor: '#EFEFEF', minHeight: '100vh', padding: '1.5rem' }}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Asset Management</h2>
          <p className="text-gray-700">Manage and track all your assets</p>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2  text-white rounded-lg hover:opacity-90 transition" style={{ backgroundColor: '#AE040F' }}
        >
          <Plus className="w-5 h-5 " />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="bg-transparent rounded-lg p-6 border border-gray-400 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search assets..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <select
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Filter */}
          <select
            value={filters.assignment}
            onChange={e => handleFilterChange('assignment', e.target.value as AssignmentFilter)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <option value="all">All Assignments</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={e => handleFilterChange('status', e.target.value as StatusFilter)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-100"
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
      <div className="bg-white rounded-lg border border-gray-300">
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-black font-semibold w-[15%]">
                  Asset Name
                </TableHead>
                <TableHead className="text-black font-semibold w-[10%]">
                  Category
                </TableHead>
                <TableHead className="text-black font-semibold w-[12%]">
                  Location
                </TableHead>
                <TableHead className="text-black font-semibold w-[8%]">
                  Status
                </TableHead>
                <TableHead className="text-black font-semibold w-[10%]">
                  Assignment
                </TableHead>
                <TableHead className="text-black font-semibold w-[15%]">
                  Assigned To
                </TableHead>
                <TableHead className="text-black font-semibold w-[10%]">
                  Purchase Date
                </TableHead>
                <TableHead className="text-black font-semibold w-[10%]">
                  Value
                </TableHead>
                <TableHead className="text-black font-semibold text-right w-[10%]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

          <TableBody>
            {paginatedAssets.map(asset => (
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
                {/* Assignment status badge */}
                <TableCell>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      asset.status === 'maintenance' 
                        ? 'bg-gray-100 text-gray-700'
                        : getAssignmentBadge(asset.assignedTo)
                    }`}
                  >
                    {asset.status === 'maintenance' ? 'Unassigned' : (asset.assignedTo && asset.assignedTo.trim() ? 'Assigned' : 'Unassigned')}
                  </span>
                </TableCell>
                {/* Assigned person */}
                <TableCell className="text-black">
                  {asset.status === 'maintenance' ? '-' : (asset.assignedTo || '-')}
                </TableCell>
                <TableCell className="text-black">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-black">
                  ₨{asset.value.toLocaleString()}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onViewDetails(asset)}
                      className="p-2 text-gray-700 hover:text-green-600 hover:bg-green-100 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onSendToMaintenance && asset.status !== 'maintenance' && (
                      <button
                        onClick={() => onSendToMaintenance(asset)}
                        className="p-2 text-gray-700 hover:text-orange-600 hover:bg-orange-100 rounded-lg"
                        title="Send to Maintenance"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(asset)}
                      className="p-2 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteAsset(asset)}
                      className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-100 rounded-lg"
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
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-700">No assets found</p>
        </div>
      )}

      {/* Pagination */}
      {filteredAssets.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 p-4 mt-4">
          <div className="flex items-center justify-between">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={e => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">
                of {totalItems} results
              </span>
            </div>

            {/* Page info and navigation */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          currentPage === pageNum
                            ? 'text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        style={currentPage === pageNum ? { backgroundColor: '#AE040F' } : {}}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteAsset}
        title="Delete Asset"
        message={`Are you sure you want to delete ${deleteAsset?.name}? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteAsset) {
            onDelete(deleteAsset.id);
            setDeleteAsset(null);
          }
        }}
        onCancel={() => setDeleteAsset(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
