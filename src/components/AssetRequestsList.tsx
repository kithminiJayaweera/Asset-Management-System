'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, User, Loader2, Link as LinkIcon } from 'lucide-react';

interface RequestedByUser {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
}

interface AssetRequest {
  _id: string;
  requestedBy?: RequestedByUser | null;
  assetId?: {
    _id: string;
    name: string;
    assetTag: string;
    category: string;
    status: string;
  } | null;
  assetCategory: string;
  requestType: 'assignment' | 'return' | 'maintenance' | 'new';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: RequestedByUser;
  approvalDate?: string;
  notes?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface Asset {
  _id: string;
  name: string;
  assetTag: string;
  category: string;
  status: string;
  location: string;
  condition: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
}

export function AssetRequestsList() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAssetSearchModal, setShowAssetSearchModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetSearchTerm, setAssetSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests');
      const result = await response.json();
      
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const openAssetSelection = async (request: AssetRequest) => {
    setSelectedRequest(request);
    setShowAssetModal(true);
    setLoadingAssets(true);
    
    try {
      // Fetch ALL available assets first
      const response = await fetch('/api/assets?status=available');
      const result = await response.json();
      
      if (result.success && result.data) {
        const allAssets = result.data.data || result.data;
        
        // Smart filtering: match by category keywords or asset name keywords
        const requestCategory = request.assetCategory.toLowerCase();
        const filteredAssets = allAssets.filter((asset: Asset) => {
          const assetCategory = asset.category.toLowerCase();
          const assetName = asset.name.toLowerCase();
          
          // Extract keywords from request category (e.g., "Office Chair" -> ["office", "chair"])
          const requestKeywords = requestCategory.split(/[\s/-]+/);
          
          // Check if category matches exactly
          if (assetCategory === requestCategory) return true;
          
          // Check if any keyword from request matches category or name
          return requestKeywords.some(keyword => 
            keyword.length > 2 && ( // Ignore small words like "a", "of"
              assetCategory.includes(keyword) || 
              assetName.includes(keyword)
            )
          );
        });
        
        setAvailableAssets(filteredAssets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const assignAssetToRequest = async (assetId: string) => {
    if (!selectedRequest) return;

    try {
      // Update the asset to assign it to the employee
      const assetResponse = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'assigned',
          assignedTo: selectedRequest.requestedBy?._id,
        }),
      });

      if (assetResponse.ok) {
        const assetName = availableAssets.find(a => a._id === assetId)?.name || assetId;
        
        // Update request status to completed AND link the asset
        await fetch(`/api/requests/${selectedRequest._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            assetId: assetId,
            notes: `Asset assigned: ${assetName}`,
          }),
        });

        // Refresh and close modal
        fetchRequests();
        setShowAssetModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error assigning asset:', error);
    }
  };

  const searchAssetsForRequest = async (request: AssetRequest) => {
    setSelectedRequest(request);
    setShowAssetSearchModal(true);
    setLoadingAssets(true);
    
    try {
      // Fetch ALL available assets for searching
      const response = await fetch('/api/assets?status=available');
      const result = await response.json();
      
      if (result.success && result.data) {
        const allAssets = result.data.data || result.data;
        const requestCategory = request.assetCategory.toLowerCase();
        
        const filteredAssets = allAssets.filter((asset: Asset) => {
          const assetCategory = asset.category.toLowerCase();
          const assetName = asset.name.toLowerCase();
          const requestKeywords = requestCategory.split(/[\s/-]+/);
          
          if (assetCategory === requestCategory) return true;
          
          return requestKeywords.some(keyword => 
            keyword.length > 2 && (
              assetCategory.includes(keyword) || 
              assetName.includes(keyword)
            )
          );
        });
        
        setAvailableAssets(filteredAssets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || req.assetCategory.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesStatus && matchesCategory;
  });

  // Get unique categories from requests
  const categories = ['all', ...Array.from(new Set(requests.map(r => r.assetCategory)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'new': return 'New Asset';
      case 'assignment': return 'Assignment';
      case 'return': return 'Return';
      case 'maintenance': return 'Maintenance';
      default: return type;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-black mb-2">Asset Requests</h2>
        <p className="text-gray-800">Manage employee asset requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Pending</p>
              <p className="text-2xl text-black">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Approved</p>
              <p className="text-2xl text-black">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Rejected</p>
              <p className="text-2xl text-black">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Filter by Asset Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map(request => (
          <div key={request._id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg text-black">
                    {request.requestedBy?.name || 'Unknown Employee'}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {request.requestedBy?.position || 'Employee'} 
                    {request.requestedBy?.department && ` • ${request.requestedBy.department}`}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {request.requestedBy?.email || 'No email'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  {getRequestTypeLabel(request.requestType)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-700 mb-1">Asset Category</p>
                <p className="text-sm text-black">{request.assetCategory}</p>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Request Type</p>
                <p className="text-sm text-black">{getRequestTypeLabel(request.requestType)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Request Date</p>
                <p className="text-sm text-black">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-700 mb-1">Reason</p>
              <p className="text-sm text-black">{request.reason}</p>
            </div>

            {request.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-700 mb-1">Notes</p>
                <p className="text-sm text-black">{request.notes}</p>
              </div>
            )}

            {/* Assigned Asset Information */}
            {request.assetId && request.status === 'completed' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-700 mb-2 font-medium">Assigned Asset</p>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-black font-medium">{request.assetId.name}</p>
                        <p className="text-xs text-gray-600">Tag: {request.assetId.assetTag} • Category: {request.assetId.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => updateRequestStatus(request._id, 'approved')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => updateRequestStatus(request._id, 'rejected', 'Request denied')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => searchAssetsForRequest(request)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors ml-auto"
                >
                  <Package className="w-4 h-4" />
                  Search Available Assets
                </button>
              </div>
            )}

            {request.status === 'approved' && request.approvalDate && !request.assetId && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-xs text-green-700">
                  Approved on {new Date(request.approvalDate).toLocaleDateString()}
                </p>
                {request.requestType === 'new' && (
                  <button
                    onClick={() => openAssetSelection(request)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Assign Asset
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-800">No asset requests found</p>
          <p className="text-sm text-gray-600 mt-2">
            {filterStatus !== 'all' || filterCategory !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Create requests via API or add test data using the seed endpoint'}
          </p>
        </div>
      )}

      {/* Asset Selection Modal */}
      {showAssetModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl text-black font-semibold">Select Asset to Assign</h3>
              <p className="text-sm text-gray-600 mt-1">
                Requested: {selectedRequest.assetCategory} | Employee: {selectedRequest.requestedBy?.name}
              </p>
              
              {/* Search Bar */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search by asset name, tag, or category..."
                  value={assetSearchTerm}
                  onChange={(e) => setAssetSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="p-6">
              {loadingAssets ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (() => {
                // Filter assets by search term
                const searchFiltered = availableAssets.filter(asset => {
                  if (!assetSearchTerm) return true;
                  const term = assetSearchTerm.toLowerCase();
                  return (
                    asset.name.toLowerCase().includes(term) ||
                    asset.assetTag.toLowerCase().includes(term) ||
                    asset.category.toLowerCase().includes(term) ||
                    asset.location.toLowerCase().includes(term)
                  );
                });

                return searchFiltered.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {assetSearchTerm 
                        ? 'No assets found matching your search' 
                        : 'No available assets found'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {assetSearchTerm 
                        ? 'Try a different search term' 
                        : `No available assets match "${selectedRequest.assetCategory}"`}
                    </p>
                    {availableAssets.length > 0 && assetSearchTerm && (
                      <button
                        onClick={() => setAssetSearchTerm('')}
                        className="mt-4 px-4 py-2 text-blue-600 hover:underline"
                      >
                        Clear search to see all {availableAssets.length} available assets
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Showing {searchFiltered.length} of {availableAssets.length} available assets
                    </p>
                    {searchFiltered.map((asset) => (
                      <div
                        key={asset._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                        onClick={() => assignAssetToRequest(asset._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg text-black font-medium">{asset.name}</h4>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {asset.category}
                              </span>
                            </div>
                            <div className="flex gap-4 mt-2">
                              <span className="text-sm text-gray-600">
                                <span className="font-medium">Tag:</span> {asset.assetTag}
                              </span>
                              <span className="text-sm text-gray-600">
                                <span className="font-medium">Location:</span> {asset.location}
                              </span>
                              <span className="text-sm text-gray-600">
                                <span className="font-medium">Condition:</span> {asset.condition}
                              </span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-4">
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowAssetModal(false);
                  setSelectedRequest(null);
                  setAssetSearchTerm('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Search Modal (Read-only for Pending Requests) */}
      {showAssetSearchModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl text-black font-semibold">Search Available Assets</h3>
              <p className="text-sm text-gray-600 mt-1">
                Looking for: {selectedRequest.assetCategory} | Requested by: {selectedRequest.requestedBy?.name}
              </p>
              
              {/* Search Bar */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search by asset name, tag, category, or location..."
                  value={assetSearchTerm}
                  onChange={(e) => setAssetSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="p-6">
              {loadingAssets ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (() => {
                const searchFiltered = availableAssets.filter(asset => {
                  if (!assetSearchTerm) return true;
                  const term = assetSearchTerm.toLowerCase();
                  return (
                    asset.name.toLowerCase().includes(term) ||
                    asset.assetTag.toLowerCase().includes(term) ||
                    asset.category.toLowerCase().includes(term) ||
                    asset.location.toLowerCase().includes(term)
                  );
                });

                return searchFiltered.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {assetSearchTerm 
                        ? 'No assets found matching your search' 
                        : 'No available assets found'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {assetSearchTerm 
                        ? 'Try a different search term' 
                        : `No available assets match "${selectedRequest.assetCategory}"`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Found {searchFiltered.length} available asset{searchFiltered.length !== 1 ? 's' : ''} matching this request
                    </p>
                    {searchFiltered.map((asset) => (
                      <div
                        key={asset._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg text-black font-medium">{asset.name}</h4>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {asset.category}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                Available
                              </span>
                            </div>
                            <div className="flex gap-4 mt-2">
                              <span className="text-sm text-gray-600">
                                <span className="font-medium">Tag:</span> {asset.assetTag}
                              </span>
                              <span className="text-sm text-gray-600">
                                <span className="font-medium">Location:</span> {asset.location}
                              </span>
                              <span className="text-sm text-gray-600">
                                <span className="font-medium">Condition:</span> {asset.condition}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowAssetSearchModal(false);
                  setSelectedRequest(null);
                  setAssetSearchTerm('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
