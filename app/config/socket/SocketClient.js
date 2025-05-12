// import { io } from 'socket.io-client';

// let socket = null;

// export const getSocketClient = (role = 'guest') => {
//   if (!socket) {
//     socket = io('http://localhost:6789', {
//       autoConnect: true,
//       transports: ['websocket'],
//       query: { role }, // hoặc query: { role }
//     });
//   } else {
//     // Update role before connecting if needed
//     socket.auth = { role };
//   }
//   return socket;
// };

// src/socket/socketClient.js
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
  }

  init(role = 'guest') {
    if (!this.socket) {
      this.socket = io('http://localhost:6789', {
        autoConnect: true,
        transports: ['websocket'],
        query: { role }, // hoặc query: { role }
      });
    }
    return this;
  }

  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  emit(event, payload) {
    this.socket?.emit(event, payload);
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  isConnected() {
    return !!this.socket?.connected;
  }

  getInstance() {
    return this.socket;
  }
}

const socketClient = new SocketClient();
export default socketClient;
