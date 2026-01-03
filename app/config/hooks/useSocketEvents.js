// Custom hooks for Socket.IO events
import { useEffect } from 'react';
import socketClient from '../socket/SocketClient';

// Lắng nghe topic
export function useSocketEvent(event, callback) {
  useEffect(() => {
    socketClient.on(event, callback);
    return () => {
      socketClient.off(event, callback);
    };
  }, [event, callback]);
}

// Send message
export function emitSocketEvent(event, data) {
  socketClient.emit(event, data);
}
