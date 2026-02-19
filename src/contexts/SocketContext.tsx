'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  clearAll: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load notifications from API on mount
  useEffect(() => {
    if (userId && !isInitialized) {
      fetch(`/api/notifications?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setNotifications(data.data);
          }
          setIsInitialized(true);
        })
        .catch(err => {
          console.error('Failed to load notifications:', err);
          setIsInitialized(true);
        });
    }
  }, [userId, isInitialized]);

  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected:', socketInstance.id);
    });

    if (userId) {
      socketInstance.emit('join', userId);
      console.log('👤 Joined room:', userId);
    }

    socketInstance.on('notification', (notification) => {
      console.log('🔔 Notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      
      // Browser notification only (no toast to avoid duplicates)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
        });
      }
    });

    socketInstance.on('asset_request_created', async (data) => {
      console.log('📝 New asset request received:', data);
      
      // Fetch current pending count
      try {
        const response = await fetch('/api/requests');
        const result = await response.json();
        const pendingCount = result.success 
          ? result.data.filter((r: any) => r.status === 'pending' && !r.archived).length 
          : 0;
        
        // Show toast notification with pending count
        toast.info('🔔 New Asset Request', {
          description: `${data.requestedBy} requested ${data.assetCategory}\n📋 Total Pending: ${pendingCount}`,
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '2px solid #5a67d8',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
          },
          action: {
            label: '👁️ View',
            onClick: () => {
              window.dispatchEvent(new CustomEvent('navigateToRequest', { detail: data.requestId }));
            },
          },
        });
      } catch (error) {
        console.error('Error fetching pending count:', error);
        // Fallback toast without count
        toast.info('🔔 New Asset Request', {
          description: `${data.requestedBy} requested ${data.assetCategory}`,
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '2px solid #5a67d8',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
          },
          action: {
            label: '👁️ View',
            onClick: () => {
              window.dispatchEvent(new CustomEvent('navigateToRequest', { detail: data.requestId }));
            },
          },
        });
      }
      
      // Trigger refresh
      window.dispatchEvent(new Event('assetRequestCreated'));
    });

    socketInstance.on('asset_updated', () => {
      console.log('🔄 Asset updated event received');
      window.dispatchEvent(new Event('assetUpdated'));
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const handleAssetUpdate = () => {
      console.log('🔄 Refreshing asset data...');
      window.dispatchEvent(new Event('refreshAssets'));
    };

    window.addEventListener('assetUpdated', handleAssetUpdate);
    return () => window.removeEventListener('assetUpdated', handleAssetUpdate);
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    
    // Only update in database if it's a valid MongoDB ObjectId (24 hex chars)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        await fetch(`/api/notifications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        });
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    
    // Clear in database
    if (userId) {
      try {
        await fetch(`/api/notifications?userId=${userId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, clearAll }}>
      {children}
    </SocketContext.Provider>
  );
}
