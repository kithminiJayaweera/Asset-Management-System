'use client';

import { useState, useRef, useEffect } from 'react';

interface NotificationBellProps {
  userId: string | null;
  organizationId: string | null;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  timestamp: Date;
}

export function NotificationBell({ userId, organizationId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from database instead of socket
  useEffect(() => {
    if (!userId || !organizationId) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setNotifications(data.data);
            const unread = data.data.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, organizationId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'asset_added':
        return '📦';
      case 'asset_approved':
        return '✅';
      case 'maintenance_due':
        return '🔧';
      case 'admin_message':
        return '💬';
      case 'asset_assigned':
        return '👤';
      case 'asset_returned':
        return '↩️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'asset_added':
        return 'border-l-blue-500';
      case 'asset_approved':
        return 'border-l-green-500';
      case 'maintenance_due':
        return 'border-l-orange-500';
      case 'admin_message':
        return 'border-l-purple-500';
      case 'asset_assigned':
        return 'border-l-cyan-500';
      case 'asset_returned':
        return 'border-l-teal-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    // Mark as read
    try {
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
        title="Notifications"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)} bg-white hover:bg-gray-50 cursor-pointer transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 text-center">
              <a
                href="/notifications"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
