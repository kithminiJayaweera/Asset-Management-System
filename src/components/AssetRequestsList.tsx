'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, User, Loader2, Archive, Star, Trash2, ArchiveRestore, UserPlus, UserX, X, Search } from 'lucide-react';

interface RequestedByUser {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  position?: string;
  department?: string;
}

interface Asset {
  _id: string;
  name: string;
  assetTag: string;
  category: string;
  status: string;
  assignedTo?: string | { _id: string; name: string };
}

interface AssetRequest {
  _id: string;
  requestedBy?: RequestedByUser | null;
  assetId?: Asset | string | null;
  assetCategory: string;
  assetName?: string;
  requestType: 'assignment' | 'return' | 'maintenance' | 'new';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: RequestedByUser;
  approvalDate?: string;
  notes?: string;
  organizationId: string;
  archived: boolean;
  archivedDate?: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AssetRequestsList() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchAssets();
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

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const result = await response.json();
      
      if (result.success) {
        // Handle paginated response structure
        const assetsData = result.data?.data || result.data || [];
        const assetsList = Array.isArray(assetsData) ? assetsData : [];
        setAssets(assetsList);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets([]);
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

  const toggleArchive = async (requestId: string, currentArchived: boolean) => {
    try {
      // Optimistic update
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId 
            ? { 
                ...req, 
                archived: !currentArchived,
                archivedDate: !currentArchived ? new Date().toISOString() : undefined
              } 
            : req
        )
      );

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          archived: !currentArchived,
          archivedDate: !currentArchived ? new Date().toISOString() : null
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        // Revert on error
        fetchRequests();
      }
    } catch (error) {
      console.error('Error archiving request:', error);
      // Revert on error
      fetchRequests();
    }
  };

  const toggleStar = async (requestId: string, currentStarred: boolean) => {
    try {
      // Optimistic update
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId 
            ? { ...req, starred: !currentStarred } 
            : req
        )
      );

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !currentStarred }),
      });

      const result = await response.json();
      
      if (!result.success) {
        // Revert on error
        fetchRequests();
      }
    } catch (error) {
      console.error('Error starring request:', error);
      // Revert on error
      fetchRequests();
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to permanently delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const assignAssetToRequest = async (requestId: string, assetId: string) => {
    try {
      const request = requests.find(r => r._id === requestId);
      if (!request?.requestedBy) {
        console.error('Request or requester not found');
        return;
      }

      // First, update the asset to assign it to the user
      const assetResponse = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: request.requestedBy._id,
          status: 'assigned'
        }),
      });

      const assetResult = await assetResponse.json();
      
      if (!assetResult.success) {
        console.error('Failed to update asset:', assetResult.error);
        alert('Failed to assign asset. Please try again.');
        return;
      }
      
      console.log('Asset updated successfully:', assetResult.data);

      // Then, update the request with the asset ID
      const requestResponse = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });

      const requestResult = await requestResponse.json();
      
      if (!requestResult.success) {
        console.error('Failed to update request:', requestResult.error);
        // Rollback asset assignment
        await fetch(`/api/assets/${assetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            assignedTo: null,
            status: 'available'
          }),
        });
        alert('Failed to link asset to request. Please try again.');
        return;
      }
        
      // Refresh both requests and assets from database
      await Promise.all([fetchRequests(), fetchAssets()]);
      
      // Close modal and reset state
      setShowAssignModal(false);
      setSelectedRequest(null);
      setSelectedAsset(null);
      setIsReadOnlyMode(false);
      
      alert('Asset successfully assigned!');
    } catch (error) {
      console.error('Error assigning asset:', error);
      alert('An error occurred while assigning the asset.');
    }
  };

  const unassignAssetFromRequest = async (requestId: string, currentAssetId: string) => {
    if (!confirm('Are you sure you want to unassign this asset from the request?')) {
      return;
    }

    try {
      // Get asset and request details
      const assetResponse = await fetch(`/api/assets/${currentAssetId}`);
      const assetResult = await assetResponse.json();
      
      if (!assetResult.success) {
        alert('Failed to fetch asset details.');
        return;
      }

      const asset = assetResult.data;
      const request = requests.find(r => r._id === requestId);
      
      // Remove user from description
      let updatedDescription = asset.description || '';
      if (request?.requestedBy?.name) {
        updatedDescription = updatedDescription
          .replace(new RegExp(`Assigned to:\\s*${request.requestedBy.name}`, 'gi'), '')
          .replace(new RegExp(request.requestedBy.name, 'gi'), '')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Update asset: unassign, set to available, clean description
      const updateAssetResponse = await fetch(`/api/assets/${currentAssetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: null,
          status: 'available',
          description: updatedDescription || 'Available for assignment'
        }),
      });

      const updateAssetResult = await updateAssetResponse.json();
      
      if (!updateAssetResult.success) {
        console.error('Failed to unassign asset:', updateAssetResult.error);
        alert('Failed to unassign asset. Please try again.');
        return;
      }

      // Remove asset from request
      const requestResponse = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: null }),
      });

      const requestResult = await requestResponse.json();
      
      if (!requestResult.success) {
        console.error('Failed to update request:', requestResult.error);
        alert('Failed to update request. Please try again.');
        return;
      }
        
      // Refresh both requests and assets
      await Promise.all([fetchRequests(), fetchAssets()]);
      
      alert('Asset successfully unassigned!');
    } catch (error) {
      console.error('Error unassigning asset:', error);
      alert('An error occurred while unassigning the asset.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesType = filterType === 'all' || req.requestType === filterType;
    
    // Handle archived filter - show archived if showArchived is true, otherwise show non-archived
    const isArchived = req.archived === true;
    const matchesArchived = showArchived ? isArchived : !isArchived;
    
    // Handle starred filter - only filter if showStarredOnly is true
    const isStarred = req.starred === true;
    const matchesStarred = showStarredOnly ? isStarred : true;
    
    return matchesStatus && matchesType && matchesArchived && matchesStarred;
  });

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

  const filteredAssets = assets.filter(asset => {
    // If showAllAssets is enabled, skip category filtering for debugging
    if (showAllAssets) {
      const matchesSearch = assetSearchQuery === '' || 
        asset.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        asset.category.toLowerCase().includes(assetSearchQuery.toLowerCase());
      return matchesSearch;
    }

    const matchesSearch = assetSearchQuery === '' || 
      asset.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(assetSearchQuery.toLowerCase());
    
    // Filter by category matching the request's assetCategory
    // Handle multi-category requests like "Laptop/PC" by splitting on / and checking if any part matches
    const assetCategory = (asset.category || '').toLowerCase().trim();
    const requestCategory = selectedRequest ? (selectedRequest.assetCategory || '').toLowerCase().trim() : '';
    
    // Split request category by / to handle combined categories
    const requestCategoryParts = requestCategory.split('/').map(part => part.trim());
    
    const matchesCategory = !selectedRequest || 
      assetCategory === requestCategory ||
      requestCategoryParts.some(part => 
        assetCategory.includes(part) || 
        part.includes(assetCategory) ||
        assetCategory === part
      );
    
    // Filter by asset name if specified in the request
    // For example, if request says "Camera" in assetName, filter electronics to show only cameras
    const requestedAssetName = selectedRequest?.assetName?.toLowerCase().trim() || '';
    const assetName = (asset.name || '').toLowerCase().trim();
    
    const matchesAssetName = !requestedAssetName || assetName.includes(requestedAssetName);
    
    // Show available assets or already assigned to any user (to see reassignment options)
    const isAvailableOrAssigned = 
      asset.status?.toLowerCase() === 'available' || 
      asset.status?.toLowerCase() === 'active' ||
      (selectedRequest && asset._id === (typeof selectedRequest.assetId === 'object' ? selectedRequest.assetId?._id : selectedRequest.assetId));
    
    const passes = matchesSearch && matchesCategory && matchesAssetName && isAvailableOrAssigned;
    
    return passes;
  });

  const openAssignModal = (request: AssetRequest, readOnly = false) => {
    setSelectedRequest(request);
    const currentAsset = typeof request.assetId === 'object' ? request.assetId : null;
    setSelectedAsset(currentAsset);
    setAssetSearchQuery('');
    setShowAssignModal(true);
    setIsReadOnlyMode(readOnly);
  };

  const handleAssignAsset = () => {
    if (selectedRequest && selectedAsset) {
      assignAssetToRequest(selectedRequest._id, selectedAsset._id);
    }
  };

  const activeRequests = requests.filter(r => r.archived !== true);
  const archivedRequests = requests.filter(r => r.archived === true);
  const starredRequests = requests.filter(r => r.starred === true);
  const pendingCount = activeRequests.filter(r => r.status === 'pending').length;
  const approvedCount = activeRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = activeRequests.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-black mb-2">Asset Requests</h2>
          <p className="text-gray-800">Manage employee asset requests</p>
        </div>
        
        {/* View Toggles */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowArchived(false);
              setShowStarredOnly(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              !showArchived && !showStarredOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Active ({activeRequests.length})
          </button>
          <button
            onClick={() => {
              setShowStarredOnly(!showStarredOnly);
              setShowArchived(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showStarredOnly
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className="w-4 h-4" />
            Starred ({starredRequests.length})
          </button>
          <button
            onClick={() => {
              setShowArchived(!showArchived);
              setShowStarredOnly(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showArchived
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Archive className="w-4 h-4" />
            Archived ({archivedRequests.length})
          </button>
        </div>
      </div>

      {/* Statistics Cards - Only show for active requests */}
      {!showArchived && !showStarredOnly && (
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
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {/* Info banner explaining current view */}
        {showArchived && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Archived View:</strong> These requests are hidden from the main view but still stored in the database. 
              You can restore them anytime or permanently delete them.
            </p>
          </div>
        )}
        {showStarredOnly && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Starred View:</strong> Showing only requests you've marked as important or favorites.
            </p>
          </div>
        )}
        {!showArchived && !showStarredOnly && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Active View:</strong> Showing all non-archived requests. Archive old requests to keep this view clean.
            </p>
          </div>
        )}
        
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
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Types</option>
              <option value="new">New Asset</option>
              <option value="assignment">Assignment</option>
              <option value="return">Return</option>
              <option value="maintenance">Maintenance</option>
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg text-black">
                      {request.requestedBy?.name || 'Unknown Employee'}
                    </h3>
                    {request.starred && (
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
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
                {request.archived && (
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Archived
                  </span>
                )}
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

            {request.archivedDate && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">
                  Archived on {new Date(request.archivedDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Assigned Asset Display - Pending Requests (Read-only search) */}
            {request.status === 'pending' && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-700 font-semibold">Available Assets</p>
                  <button
                    onClick={() => openAssignModal(request, true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                    title="Search Assets"
                  >
                    <Search className="w-3 h-3" />
                    Search Assets
                  </button>
                </div>
                <p className="text-sm text-gray-600 italic mt-2">Approve this request to assign an asset</p>
              </div>
            )}

            {/* Assigned Asset Display - Approved Requests (Full assign/reassign) */}
            {request.status === 'approved' && (() => {
              const assetObj = typeof request.assetId === 'object' ? request.assetId : null;
              const assetAssignedTo = assetObj?.assignedTo;
              const assetAssignedToId = typeof assetAssignedTo === 'object' ? assetAssignedTo._id : assetAssignedTo;
              const requestedById = request.requestedBy?._id;
              const isAssignedToRequester = assetObj && assetAssignedToId === requestedById;
              const isAssignedToSomeoneElse = assetObj && assetAssignedToId && assetAssignedToId !== requestedById;

              return (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-700 font-semibold">Assigned Asset</p>
                    <div className="flex gap-2">
                      {assetObj && isAssignedToRequester && (
                        <button
                          onClick={() => unassignAssetFromRequest(request._id, assetObj._id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
                          title="Unassign Asset"
                        >
                          <UserX className="w-3 h-3" />
                          Unassign
                        </button>
                      )}
                      <button
                        onClick={() => openAssignModal(request, false)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        title={assetObj ? 'Reassign Asset' : 'Assign Asset'}
                      >
                        <UserPlus className="w-3 h-3" />
                        {assetObj && isAssignedToRequester ? 'Reassign' : 'Assign'}
                      </button>
                    </div>
                  </div>
                  {isAssignedToRequester ? (
                    <div className="flex items-start gap-3 mt-2">
                      <div className="p-2 bg-blue-100 rounded">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-black font-medium">{assetObj.name}</p>
                        <p className="text-xs text-gray-700">Asset Tag: {assetObj.assetTag}</p>
                        <p className="text-xs text-gray-700">Category: {assetObj.category}</p>
                        <p className="text-xs text-green-700 font-semibold mt-1">✓ Assigned to {request.requestedBy?.name}</p>
                      </div>
                    </div>
                  ) : isAssignedToSomeoneElse ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 italic">No asset assigned to {request.requestedBy?.name} yet</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Note: Asset "{assetObj.name}" is assigned to another person
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic mt-2">No asset assigned yet</p>
                  )}
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 flex-wrap">
              {/* Approve/Reject for pending requests */}
              {request.status === 'pending' && !request.archived && (
                <>
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
                </>
              )}

              {/* Star/Unstar button */}
              <button
                onClick={() => toggleStar(request._id, request.starred)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  request.starred
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={request.starred ? 'Remove star' : 'Add star'}
              >
                <Star className={`w-4 h-4 ${request.starred ? 'fill-yellow-500' : ''}`} />
                {request.starred ? 'Starred' : 'Star'}
              </button>

              {/* Archive/Unarchive button */}
              <button
                onClick={() => toggleArchive(request._id, request.archived)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  request.archived
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={request.archived ? 'Restore from archive' : 'Move to archive'}
              >
                {request.archived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4" />
                    Restore
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Archive
                  </>
                )}
              </button>

              {/* Delete button - only for archived requests */}
              {request.archived && (
                <button
                  onClick={() => deleteRequest(request._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Permanently delete this request"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>

            {request.status === 'approved' && request.approvalDate && !request.archived && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-xs text-green-700">
                  Approved on {new Date(request.approvalDate).toLocaleDateString()}
                </p>
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
            {filterStatus !== 'all' || filterType !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Create requests via API or add test data using the seed endpoint'}
          </p>
        </div>
      )}

      {/* Assign Asset Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl text-black">
                  {isReadOnlyMode ? 'Search Available Assets' : (selectedRequest.assetId ? 'Reassign Asset' : 'Assign Asset')}
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Request by {selectedRequest.requestedBy?.name || 'Unknown'} • Category: {selectedRequest.assetCategory}
                </p>
                {isReadOnlyMode && (
                  <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 px-2 py-1 rounded inline-block">
                    ℹ️ Approve this request to assign assets
                  </p>
                )}
                {!isReadOnlyMode && (
                  <p className="text-xs text-blue-700 mt-2 bg-blue-50 px-2 py-1 rounded inline-block">
                    Showing only {selectedRequest.assetCategory} assets
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                  setSelectedAsset(null);
                  setAssetSearchQuery('');
                  setIsReadOnlyMode(false);
                  setShowAllAssets(false);
                }}
                className="text-gray-600 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                Search Assets
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700" />
                <input
                  type="text"
                  placeholder="Search by name, asset tag, or category..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>

            {/* Current Selection */}
            {selectedAsset && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-gray-700 mb-2">Selected Asset</p>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-black font-medium">{selectedAsset.name}</p>
                    <p className="text-xs text-gray-700">Tag: {selectedAsset.assetTag} • {selectedAsset.category}</p>
                    <p className="text-xs text-gray-700">Status: {selectedAsset.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Asset List */}
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-3">
                Available Assets ({filteredAssets.length} of {assets.length} total)
              </p>
              {assets.length > 0 && filteredAssets.length === 0 && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 mb-2">
                    <strong>Debug:</strong> {assets.length} total assets found, but none match category "{selectedRequest.assetCategory}". 
                    Check if asset categories in database match the request category exactly.
                  </p>
                  <button
                    onClick={() => setShowAllAssets(!showAllAssets)}
                    className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    {showAllAssets ? 'Hide All Assets' : 'Show All Assets (Debug)'}
                  </button>
                </div>
              )}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAssets.map(asset => (
                  <div
                    key={asset._id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAsset?._id === asset._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded ${
                        selectedAsset?._id === asset._id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Package className={`w-5 h-5 ${
                          selectedAsset?._id === asset._id ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-black font-medium">{asset.name}</p>
                        <p className="text-xs text-gray-700">Asset Tag: {asset.assetTag}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            {asset.category}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            asset.status === 'available' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {asset.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="p-8 text-center text-gray-600">
                    <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-sm">
                      {assetSearchQuery 
                        ? `No ${selectedRequest.assetCategory} assets found matching your search` 
                        : `No available ${selectedRequest.assetCategory} assets found`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                  setSelectedAsset(null);
                  setAssetSearchQuery('');
                  setIsReadOnlyMode(false);
                  setShowAllAssets(false);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isReadOnlyMode ? 'Close' : 'Cancel'}
              </button>
              {!isReadOnlyMode && (
                <button
                  onClick={handleAssignAsset}
                  disabled={!selectedAsset}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedAsset
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {selectedRequest.assetId ? 'Reassign Asset' : 'Assign Asset'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
