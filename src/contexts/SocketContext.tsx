'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
  const [notifications, setNotifications] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

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
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
        });
      }
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
      window.location.reload();
    };

    window.addEventListener('assetUpdated', handleAssetUpdate);
    return () => window.removeEventListener('assetUpdated', handleAssetUpdate);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, clearAll }}>
      {children}
    </SocketContext.Provider>
  );
}
