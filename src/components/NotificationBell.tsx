'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

interface NotificationBellProps {
  onNavigate?: (type: string, id: string) => void;
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, clearAll } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'asset_request':
        return <Package className="w-4 h-4" />;
      case 'request_approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'request_rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50 hover:bg-gray-100';
    
    switch (type) {
      case 'asset_request':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'request_approved':
        return 'bg-green-50 hover:bg-green-100';
      case 'request_rejected':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'bg-purple-50 hover:bg-purple-100';
    }
  };

  const getNotificationTextColor = (type: string) => {
    switch (type) {
      case 'asset_request':
        return 'text-blue-700';
      case 'request_approved':
        return 'text-green-700';
      case 'request_rejected':
        return 'text-red-700';
      default:
        return 'text-purple-700';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {mounted && unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-purple-50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-600 mt-1">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
                  title="Clear all notifications"
                >
                  Clear all
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm mt-1">All quiet on the asset front!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${getNotificationBgColor(notification.type, notification.read)}`}
                  onClick={() => {
                    markAsRead(notification._id);
                    const data = notification.data || {};
                    
                    console.log('Notification clicked:', {
                      title: notification.title,
                      type: notification.type,
                      data: data,
                      onNavigate: !!onNavigate
                    });
                    
                    if (onNavigate) {
                      if (notification.type === 'asset_request' && data.requestId) {
                        console.log('Navigating to asset-requests');
                        onNavigate('asset-requests', data.requestId);
                      } else if ((notification.type === 'request_approved' || notification.type === 'request_rejected') && data.requestId) {
                        console.log('Navigating to asset-requests');
                        onNavigate('asset-requests', data.requestId);
                      } else if ((notification.type === 'asset_assigned' || notification.type === 'asset_updated') && data.assetId) {
                        console.log('Navigating to asset-detail');
                        onNavigate('asset-detail', data.assetId);
                      } else if (notification.title === 'New Asset Added') {
                        console.log('Navigating to assets list');
                        onNavigate('assets', '');
                      } else {
                        console.log('No navigation match found');
                      }
                    } else {
                      console.log('onNavigate callback not provided');
                    }
                    
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getNotificationTextColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
