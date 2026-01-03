/**
 * Socket.IO Client Singleton Instance
 *
 * File này export một instance duy nhất của SocketClient
 * để sử dụng trong toàn bộ ứng dụng.
 *
 * Usage:
 * import socketClient from './config/socket/SocketClient';
 *
 * // Khởi tạo kết nối
 * socketClient.init('admin');
 *
 * // Emit event
 * socketClient.emit('EVENT_NAME', { data });
 *
 * // Listen event
 * socketClient.on('EVENT_NAME', (data) => {
 *   console.log(data);
 * });
 *
 * // Cleanup
 * socketClient.off('EVENT_NAME', callback);
 */

import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.role = null;
  }

  /**
   * Khởi tạo socket connection
   * @param {string} role - Role của user (admin, judge, guest)
   * @returns {SocketClient} - Instance của SocketClient
   */
  init(role = 'guest') {
            console.log('this.socket: ', this.socket);

    if (!this.socket) {
      this.role = role;
      this.socket = io('http://localhost:6789', {
        autoConnect: true,
        transports: ['websocket'],
        query: { role },
      });

      // Log connection events
      this.socket.on('connect', () => {
        console.log(`Socket connected with role: ${role}, ID: ${this.socket.id}`);
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected. Reason: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this;
  }

  /**
   * Kết nối socket (nếu chưa kết nối)
   */
  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      console.log('Reconnecting socket...');
    }
    return this;
  }

  /**
   * Ngắt kết nối socket
   */
  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
  }

  /**
   * Emit event đến server
   * @param {string} event - Tên event
   * @param {any} payload - Data gửi đi
   */
  emit(event, payload) {
    if (this.socket) {
      this.socket.emit(event, payload);
      console.log(`Emit event: ${event}`, payload);
    } else {
      console.warn('Socket not initialized. Call init() first.');
    }
  }

  /**
   * Lắng nghe event từ server
   * @param {string} event - Tên event
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('Socket not initialized. Call init() first.');
    }
  }

  /**
   * Huỷ lắng nghe event
   * @param {string} event - Tên event
   * @param {function} callback - Callback function
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Kiểm tra socket đã kết nối chưa
   * @returns {boolean}
   */
  isConnected() {
    return !!this.socket?.connected;
  }

  /**
   * Lấy socket instance
   * @returns {Socket}
   */
  getInstance() {
    return this.socket;
  }

  /**
   * Lấy socket ID
   * @returns {string}
   */
  getSocketId() {
    return this.socket?.id;
  }

  /**
   * Lấy role hiện tại
   * @returns {string}
   */
  getRole() {
    return this.role;
  }
}

// Export singleton instance
const socketClient = new SocketClient();
export default socketClient;
