// src/hooks/useSocketEvents.js
import { useEffect } from 'react';
import socketClient from '../socket/socketClient';

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
