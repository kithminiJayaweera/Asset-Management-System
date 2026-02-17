'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors "
      >
        <Bell className="w-6 h-6" />
        {mounted && unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all
                </button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-[#D1B9CC] cursor-pointer ${
                    !notification.read ? 'bg-purple-50' : ''
                  }`}
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-black">{notification.title}</p>
                      <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1"></div>
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
