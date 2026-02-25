import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

declare global {
  var io: SocketIOServer | undefined;
}

let io: SocketIOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (typeof global !== 'undefined' && global.io) {
    return global.io;
  }
  console.warn('⚠️ Socket.IO not available on global');
  return null;
};

export const emitNotification = (userId: string, notification: any) => {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
    console.log(`📤 Notification sent to user ${userId}`);
  } else {
    console.error('❌ Cannot emit notification - Socket.IO not initialized');
  }
};

export const broadcastNotification = (notification: any) => {
  const io = getIO();
  if (io) {
    io.emit('notification', notification);
    console.log('📢 Notification broadcast to all users:', notification.title);
  } else {
    console.error('❌ Cannot broadcast notification - Socket.IO not initialized');
  }
};

export const emitAssetUpdate = (data?: { assetId: string; message: string }) => {
  const io = getIO();
  if (io) {
    io.emit('asset_updated', data);
    console.log('🔄 Asset update broadcast', data);
  } else {
    console.error('❌ Cannot emit asset update - Socket.IO not initialized');
  }
};
