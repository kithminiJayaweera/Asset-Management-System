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

  // Load notifications from API on mount and poll every 5 seconds
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = () => {
      fetch(`/api/notifications?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            // Filter out old notifications without relatedId
            const validNotifications = data.data.filter((n: any) => n.relatedId);
            setNotifications(validNotifications);
            
            // Delete invalid notifications from database
            const invalidNotifications = data.data.filter((n: any) => !n.relatedId);
            invalidNotifications.forEach((n: any) => {
              fetch(`/api/notifications/${n._id}`, { method: 'DELETE' }).catch(() => {});
            });
          }
          setIsInitialized(true);
        })
        .catch(err => {
          console.error('Failed to load notifications:', err);
          setIsInitialized(true);
        });
    };

    fetchNotifications();
    const pollInterval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(pollInterval);
  }, [userId]);

   useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected:', socketInstance.id);
    });

    if (userId) {
      socketInstance.emit('join', userId);
      console.log('👤 Joined room:', userId);
    }

    socketInstance.on('notification', (notification) => {
      console.log('Notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      // No browser notification popup from localhost
    });

    socketInstance.on('asset_request_created', async (data) => {
      console.log('New asset request received:', data);
      
      // Create notification in database
      try {
        const notifResponse = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'admin',
            type: 'asset-requests',
            title: 'New Asset Request',
            message: `${data.requestedBy} requested ${data.assetCategory}`,
            relatedId: data.requestId,
          }),
        });
        
        if (notifResponse.ok) {
          const notifResult = await notifResponse.json();
          if (notifResult.success) {
            setNotifications((prev) => {
              const exists = prev.some(n => n._id === notifResult.data._id);
              if (exists) return prev;
              return [notifResult.data, ...prev];
            });
          }
        }
      } catch (error) {
        console.error('Error creating notification:', error);
      }
      
      // Fetch current pending count
      try {
        const response = await fetch('/api/requests');
        const result = await response.json();
        const pendingCount = result.success 
          ? result.data.filter((r: any) => r.status === 'pending' && !r.archived).length 
          : 0;
        
        // Show toast notification with pending count
        toast.info('New Asset Request', {
          description: `${data.requestedBy} requested ${data.assetCategory}\nTotal Pending: ${pendingCount}`,
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #8E1616 0%, #D84040 100%)',
            color: 'white',
            border: '2px solid #8E1616',
            boxShadow: '0 10px 25px rgba(216, 64, 64,0.4)',
          },
          action: {
            label: 'View',
            onClick: () => {
              window.dispatchEvent(new CustomEvent('navigateToRequest', { detail: data.requestId }));
            },
          },
          actionButtonStyle: { color: 'white' },
        });
      } catch (error) {
        console.error('Error fetching pending count:', error);
        toast.info('New Asset Request', {
          description: `${data.requestedBy} requested ${data.assetCategory}`,
          duration: 8000,
          style: {
            background: 'linear-gradient(135deg, #8E1616 0%, #D84040 100%)',
            color: 'white',
            border: '2px solid #8E1616',
            boxShadow: '0 10px 25px rgba(216, 64, 64,0.4)',
          },
          action: {
            label: 'View',
            onClick: () => {
              window.dispatchEvent(new CustomEvent('navigateToRequest', { detail: data.requestId }));
            },
          },
          actionButtonStyle: { color: 'white' },
        });
      }
      
      // Trigger refresh
      window.dispatchEvent(new Event('assetRequestCreated'));
    });

    socketInstance.on('asset_updated', async (data) => {
      console.log('Asset updated event received:', data);
      
      if (data?.assetId && userId) {
        try {
          const notifResponse = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              type: 'asset_updated',
              title: 'Asset Updated',
              message: data.message || 'An asset has been updated',
              relatedId: data.assetId,
            }),
          });
          
          if (notifResponse.ok) {
            const notifResult = await notifResponse.json();
            if (notifResult.success) {
              setNotifications((prev) => {
                const exists = prev.some(n => n._id === notifResult.data._id);
                if (exists) return prev;
                return [notifResult.data, ...prev];
              });
            }
          }
        } catch (error) {
          console.error('Error creating notification:', error);
        }
      }
      
      window.dispatchEvent(new Event('assetUpdated'));
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const handleAssetUpdate = () => {
      console.log('Refreshing asset data...');
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
    // Clear in database first
    if (userId) {
      try {
        await fetch(`/api/notifications?userId=${userId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to clear notifications:', err);
      }
    }
    
    // Then clear local state
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, clearAll }}>
      {children}
    </SocketContext.Provider>
  );
}
