'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Package, CheckCircle, XCircle, Clock, User, Loader2, Archive, Star, Trash2, ArchiveRestore, UserPlus, UserX, X, Search, Link } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';

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

export function AssetRequestsList({ highlightRequestId }: { highlightRequestId?: string | null }) {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRequest, setRejectingRequest] = useState<AssetRequest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [unassignConfirm, setUnassignConfirm] = useState<{requestId: string; assetId: string} | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchAssets();
    
    // Listen for real-time request updates
    const handleNewRequest = () => {
      console.log('New request event received, refreshing...');
      fetchRequests();
    };
    
    window.addEventListener('assetRequestCreated', handleNewRequest);
    
    // Poll for new requests every 5 seconds for cross-device sync
    const pollInterval = setInterval(() => {
      fetchRequests();
    }, 5000);
    
    return () => {
      window.removeEventListener('assetRequestCreated', handleNewRequest);
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (highlightRequestId && requests.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`request-${highlightRequestId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-purple-500');
          setTimeout(() => element.classList.remove('ring-4', 'ring-purple-500'), 3000);
        }
      }, 100);
    }
  }, [highlightRequestId, requests]);

  const fetchRequests = async () => {
    try {
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

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected', notes?: string, assetId?: string) => {
    try {
      const payload: any = { status, notes };
      if (assetId) payload.assetId = assetId;

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchRequests();
        const message = status === 'approved' ? 'Request approved successfully!' : 'Request rejected successfully!';
        console.log('Showing toast:', message);
        toast.success(message);
      } else {
        console.log('Showing error toast');
        toast.error('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Error updating request');
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
        fetchRequests();
        toast.error('Failed to archive request');
      } else {
        toast.success(currentArchived ? 'Request restored successfully!' : 'Request archived successfully!');
      }
    } catch (error) {
      console.error('Error archiving request:', error);
      fetchRequests();
      toast.error('Error archiving request');
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
        fetchRequests();
        toast.error('Failed to star request');
      }
    } catch (error) {
      console.error('Error starring request:', error);
      fetchRequests();
      toast.error('Error starring request');
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        fetchRequests();
        toast.success('Request deleted successfully!');
      } else {
        toast.error('Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Error deleting request');
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
          assignedTo: request.requestedBy._id
        }),
      });

      const assetResult = await assetResponse.json();
      
      if (!assetResult.success) {
        console.error('Failed to update asset:', assetResult.error);
        toast.error('Failed to assign asset');
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
            assignedTo: null
          }),
        });
        toast.error('Failed to link asset to request');
        return;
      }
        
      // Refresh both requests and assets from database
      await Promise.all([fetchRequests(), fetchAssets()]);
      
      // Close modal and reset state
      setShowAssignModal(false);
      setSelectedRequest(null);
      setSelectedAsset(null);
      setIsReadOnlyMode(false);
      
      toast.success('Asset assigned successfully!');
    } catch (error) {
      console.error('Error assigning asset:', error);
      toast.error('Error assigning asset');
    }
  };

  const unassignAssetFromRequest = async (requestId: string, currentAssetId: string) => {
    try {
      // Get asset and request details
      const assetResponse = await fetch(`/api/assets/${currentAssetId}`);
      const assetResult = await assetResponse.json();
      
      if (!assetResult.success) {
        toast.error('Failed to fetch asset details');
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
      
      // Update asset: unassign and clean description
      const updateAssetResponse = await fetch(`/api/assets/${currentAssetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedTo: null,
          description: updatedDescription || 'Available for assignment'
        }),
      });

      const updateAssetResult = await updateAssetResponse.json();
      
      if (!updateAssetResult.success) {
        console.error('Failed to unassign asset:', updateAssetResult.error);
        toast.error('Failed to unassign asset');
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
        toast.error('Failed to update request');
        return;
      }
        
      // Refresh both requests and assets
      await Promise.all([fetchRequests(), fetchAssets()]);
      
      toast.success('Asset unassigned successfully!');
    } catch (error) {
      console.error('Error unassigning asset:', error);
      toast.error('Error unassigning asset');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesType = filterType === 'all' || req.requestType === filterType;
    const matchesCategory = filterCategory === 'all' || req.assetCategory === filterCategory;
    
    // Handle archived filter - show archived if showArchived is true, otherwise show non-archived
    const isArchived = req.archived === true;
    const matchesArchived = showArchived ? isArchived : !isArchived;
    
    // Handle starred filter - only filter if showStarredOnly is true
    const isStarred = req.starred === true;
    const matchesStarred = showStarredOnly ? isStarred : true;
    
    return matchesStatus && matchesType && matchesCategory && matchesArchived && matchesStarred;
  });

  // Get unique categories from requests
  const categories = ['all', ...Array.from(new Set(requests.map(r => r.assetCategory)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-blue-800';
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

  // Normalize category names to handle variations like "Laptop/PC" vs "PC/Laptop"
  const normalizeCategory = (category: string): string => {
    const normalized = category.toLowerCase().trim();
    // Normalize laptop/pc variations
    if (normalized.includes('laptop') && normalized.includes('pc')) {
      return 'pc/laptop';
    }
    return normalized;
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
    const assetCategory = normalizeCategory(asset.category || '');
    const requestCategory = selectedRequest ? normalizeCategory(selectedRequest.assetCategory || '') : '';
    
    // Match normalized categories
    const matchesCategory = !selectedRequest || assetCategory === requestCategory;
    
    // Debug all assets
    if (selectedRequest) {
      console.log('Asset filter:', {
        assetName: asset.name,
        assetCategory,
        requestCategory,
        match: matchesCategory,
        status: asset.status
      });
    }
    
    // Filter by asset name if specified in the request
    // For example, if request says "Camera" in assetName, filter electronics to show only cameras
    const requestedAssetName = selectedRequest?.assetName?.toLowerCase().trim() || '';
    const assetName = (asset.name || '').toLowerCase().trim();
    
    const matchesAssetName = !requestedAssetName || assetName.includes(requestedAssetName);
    
    // Show available assets or already assigned assets (to allow reassignment)
    const isAvailableOrAssigned = 
      asset.status?.toLowerCase() === 'available' || 
      asset.status?.toLowerCase() === 'active' ||
      asset.status?.toLowerCase() === 'assigned' ||
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

  const handleAssignAsset = async () => {
    if (selectedRequest && selectedAsset) {
      if (selectedRequest.status === 'pending') {
        // Approve request and assign asset in one action
        try {
          // First update asset
          const assetResponse = await fetch(`/api/assets/${selectedAsset._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              assignedTo: selectedRequest.requestedBy?._id
            }),
          });

          const assetResult = await assetResponse.json();
          
          if (!assetResult.success) {
            toast.error('Failed to assign asset');
            return;
          }

          // Then approve request with asset
          await updateRequestStatus(selectedRequest._id, 'approved', 'Request approved with asset assignment', selectedAsset._id);
          
          await Promise.all([fetchRequests(), fetchAssets()]);
          
          setShowAssignModal(false);
          setSelectedRequest(null);
          setSelectedAsset(null);
          setIsReadOnlyMode(false);
          
          toast.success('Request approved and asset assigned successfully!');
        } catch (error) {
          console.error('Error approving with asset:', error);
          toast.error('Error approving request');
        }
      } else {
        // Existing reassign logic for approved requests
        assignAssetToRequest(selectedRequest._id, selectedAsset._id);
      }
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between ml-5 ">
        <div>
          <h2 className="text-2xl text-black mb-2 mt-5">Asset Requests</h2>
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
                ? 'bg-purple-500 text-white'
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
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
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
          <div 
            key={request._id} 
            id={`request-${request._id}`}
            className={`bg-white rounded-lg border border-gray-200 p-6 transition-all ${
              highlightRequestId === request._id ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
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

            {/* Assigned Asset Display - Pending Requests */}
            {request.status === 'pending' && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-purple-700 font-semibold">Asset Assignment</p>
                </div>
                <p className="text-sm text-gray-700 mt-2">Click "Approve & Assign" to select an available {request.assetCategory} asset and approve this request</p>
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
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-700 font-semibold">Assigned Asset</p>
                    <div className="flex gap-2">
                      {assetObj && isAssignedToRequester && (
                        <button
                          onClick={() => setUnassignConfirm({requestId: request._id, assetId: assetObj._id})}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
                          title="Unassign Asset"
                        >
                          <UserX className="w-3 h-3" />
                          Unassign
                        </button>
                      )}
                      <button
                        onClick={() => openAssignModal(request, false)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-600 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                        title={assetObj ? 'Reassign Asset' : 'Assign Asset'}
                      >
                        <UserPlus className="w-3 h-3" />
                        {assetObj && isAssignedToRequester ? 'Reassign' : 'Assign'}
                      </button>
                    </div>
                  </div>
                  {isAssignedToRequester ? (
                    <div className="flex items-start gap-3 mt-2">
                      <div className="p-2 bg-purple-100 rounded">
                        <Package className="w-4 h-4 text-purple-600" />
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
                    onClick={() => openAssignModal(request, false)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve & Assign
                  </button>
                  <button
                    onClick={() => {
                      setRejectingRequest(request);
                      setRejectReason('');
                      setShowRejectModal(true);
                    }}
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
                  onClick={() => setDeleteConfirm(request._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Permanently delete this request"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
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

      {/* Reject Reason Modal */}
      {showRejectModal && rejectingRequest && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-slideUp border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl text-black">Reject Request</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Request by {rejectingRequest.requestedBy?.name || 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingRequest(null);
                  setRejectReason('');
                }}
                className="text-gray-600 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black resize-none"
              />
              <p className="text-xs text-gray-600 mt-2">
                This reason will be sent to {rejectingRequest.requestedBy?.name} via email
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingRequest(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    toast.error('Please provide a reason for rejection');
                    return;
                  }
                  await updateRequestStatus(rejectingRequest._id, 'rejected', rejectReason);
                  setShowRejectModal(false);
                  setRejectingRequest(null);
                  setRejectReason('');
                }}
                disabled={!rejectReason.trim()}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  rejectReason.trim()
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl text-black">
                  {selectedRequest.status === 'pending' ? 'Select Asset to Approve Request' : (selectedRequest.assetId ? 'Reassign Asset' : 'Assign Asset')}
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  Request by {selectedRequest.requestedBy?.name || 'Unknown'} • Category: {selectedRequest.assetCategory}
                </p>
                {selectedRequest.status === 'pending' && (
                  <p className="text-xs text-green-700 mt-2 bg-green-50 px-2 py-1 rounded inline-block">
                    Select an asset below to approve and assign in one action
                  </p>
                )}
                {selectedRequest.status === 'approved' && (
                  <p className="text-xs text-purple-700 mt-2 bg-purple-50 px-2 py-1 rounded inline-block">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                />
              </div>
            </div>

            {/* Current Selection */}
            {selectedAsset && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-gray-700 mb-2">Selected Asset</p>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <Package className="w-5 h-5 text-purple-600" />
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
                  </p>
                  <p className="text-xs text-yellow-700 mb-2">
                    Asset categories in database: {Array.from(new Set(assets.map(a => a.category))).join(', ')}
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
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded ${
                        selectedAsset?._id === asset._id ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Package className={`w-5 h-5 ${
                          selectedAsset?._id === asset._id ? 'text-purple-600' : 'text-gray-600'
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
                      ? (selectedRequest.status === 'pending' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-purple-500 text-white hover:bg-purple-600')
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedRequest.status === 'pending' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve & Assign
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {selectedRequest.assetId ? 'Reassign Asset' : 'Assign Asset'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Request"
        message="Are you sure you want to permanently delete this request? This action cannot be undone."
        onConfirm={() => {
          if (deleteConfirm) {
            deleteRequest(deleteConfirm);
            setDeleteConfirm(null);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={!!unassignConfirm}
        title="Unassign Asset"
        message="Are you sure you want to unassign this asset from the request?"
        onConfirm={() => {
          if (unassignConfirm) {
            unassignAssetFromRequest(unassignConfirm.requestId, unassignConfirm.assetId);
            setUnassignConfirm(null);
          }
        }}
        onCancel={() => setUnassignConfirm(null)}
        confirmText="Unassign"
        cancelText="Cancel"
      />
    </div>
  );
}
