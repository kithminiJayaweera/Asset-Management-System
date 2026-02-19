'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useSocket } from '@/contexts/SocketContext';
import { Bell, Package, Clock, User, AlertCircle, X, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetRequestPopupProps {
  onViewRequest?: (requestId: string) => void;
}

export function AssetRequestPopup({ onViewRequest }: AssetRequestPopupProps) {
  const { notifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  useEffect(() => {
    // Check for new asset_request notifications
    const latestNotification = notifications[0];
    
    if (
      latestNotification && 
      latestNotification.type === 'asset_request' && 
      !latestNotification.read &&
      currentNotification?._id !== latestNotification._id
    ) {
      setCurrentNotification(latestNotification);
      setIsOpen(true);
    }
  }, [notifications, currentNotification]);

  const handleViewRequest = () => {
    if (currentNotification?.data?.requestId && onViewRequest) {
      onViewRequest(currentNotification.data.requestId);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'asset_request':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'request_approved':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'request_rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Bell className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGetRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'new':
        return 'New Asset';
      case 'assignment':
        return 'Assignment';
      case 'return':
        return 'Return';
      case 'maintenance':
        return 'Maintenance';
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-start gap-3 pb-4">
          <div className="p-3 bg-blue-100 rounded-lg shrink-0">
            {getNotificationIcon(currentNotification?.type || '')}
          </div>
          <div className="flex-1">
            <DialogTitle className="text-2xl font-bold text-black">
              {currentNotification?.title || 'Asset Request'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-base">
              {currentNotification?.message}
            </DialogDescription>
          </div>
          <DialogClose className="text-gray-500 hover:text-gray-700" />
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Summary */}
          <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentNotification?.data?.requestId && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Request ID</p>
                  <p className="text-sm font-mono text-gray-900 font-bold">{String(currentNotification.data.requestId).slice(0, 12)}...</p>
                </div>
              )}
              
              {currentNotification?.data?.status && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(currentNotification.data.status)}`}>
                    {currentNotification.data.status.charAt(0).toUpperCase() + currentNotification.data.status.slice(1)}
                  </span>
                </div>
              )}

              {currentNotification?.data?.requestType && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Request Type</p>
                  <p className="text-sm text-gray-900 font-medium">{getGetRequestTypeLabel(currentNotification.data.requestType)}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Created</p>
                <p className="text-sm text-gray-900">{new Date(currentNotification?.createdAt).toLocaleDateString()}</p>
              </div>

              {currentNotification?.data?.assetCategory && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Category</p>
                  <p className="text-sm text-gray-900 font-medium">{currentNotification.data.assetCategory}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Time</p>
                <p className="text-sm text-gray-900">
                  {new Date(currentNotification?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Requester Info */}
          {currentNotification?.data?.requesterName && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Requested By
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Name:</span> {currentNotification.data.requesterName}
                </p>
                {currentNotification?.data?.requesterPosition && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Position:</span> {currentNotification.data.requesterPosition}
                  </p>
                )}
                {currentNotification?.data?.requesterEmail && (
                  <p className="text-sm text-blue-600">
                    <span className="font-semibold">Email:</span> {currentNotification.data.requesterEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Asset Details */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Asset Information
            </h4>
            <div className="space-y-2">
              {currentNotification?.data?.assetCategory && (
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Category:</span> {currentNotification.data.assetCategory}
                </p>
              )}
              {currentNotification?.data?.assetName && (
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Specific Model/Name:</span> {currentNotification.data.assetName}
                </p>
              )}
            </div>
          </div>

          {/* Request Reason */}
          {currentNotification?.data?.reason && (
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                Request Reason
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentNotification.data.reason}
              </p>
            </div>
          )}

          {/* Additional Notes */}
          {currentNotification?.data?.notes && (
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-green-600" />
                Admin Notes
              </h4>
              <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                {currentNotification.data.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleViewRequest}
          >
            <Package className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
