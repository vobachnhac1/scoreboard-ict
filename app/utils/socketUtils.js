/**
 * Socket Utility Functions
 * Common functions for socket initialization and management
 */

import { socketClient } from "../config/routes";

/**
 * Khởi tạo socket connection
 * @param {Object} options - Configuration options
 * @param {Function} options.dispatch - Redux dispatch function
 * @param {Function} options.connectSocket - Redux action to connect socket
 * @param {Object} options.socket - Current socket state from Redux
 * @param {string} options.role - Role for socket connection (admin, judge, guest)
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Promise<boolean>} - Returns true if connected successfully
 */
export const initSocket = async ({
  dispatch,
  connectSocket,
  socket,
  role = 'guest',
  onSuccess,
  onError,
  forceReConnection = false,
  disconnectSocket
}) => {
  try {
    console.log("🔍 Checking socket status:", socket?.connected, socketClient.isConnected());
     if(forceReConnection){
      await dispatch(disconnectSocket());
      await new Promise((resolve) => setTimeout(resolve, 500));

    }

    // Kiểm tra xem socket đã connected chưa
    if (!socket?.connected || !socketClient.isConnected()) {
      console.log(`⚡ Khởi tạo socket connection với role: ${role}...`);
      
      // Dispatch Redux action to connect socket
      await dispatch(connectSocket(role));
      
      // Đợi một chút để đảm bảo socket đã sẵn sàng
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      console.log("✅ Socket connected successfully");
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } else {
      console.log("✅ Socket already connected");
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    }
  } catch (error) {
    console.error("❌ Error initializing socket:", error);
    
    if (onError) {
      onError(error);
    }
    
    return false;
  }
};

/**
 * Kiểm tra trạng thái kết nối socket
 * @param {Object} socket - Socket state from Redux
 * @returns {boolean} - Returns true if connected
 */
export const isSocketConnected = (socket) => {
  return socket?.connected && socketClient.isConnected();
};

/**
 * Reconnect socket nếu bị mất kết nối
 * @param {Object} options - Configuration options
 * @param {Function} options.dispatch - Redux dispatch function
 * @param {Function} options.connectSocket - Redux action to connect socket
 * @param {Object} options.socket - Current socket state from Redux
 * @param {string} options.role - Role for socket connection
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Promise<boolean>} - Returns true if reconnected successfully
 */
export const reconnectSocket = async ({
  dispatch,
  connectSocket,
  socket,
  role = 'guest',
  onSuccess,
  onError
}) => {
  try {
    console.log("🔄 Reconnecting socket...");
    
    // Force reconnect
    await dispatch(connectSocket(role));
    
    // Đợi một chút để đảm bảo socket đã sẵn sàng
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (isSocketConnected(socket)) {
      console.log("✅ Socket reconnected successfully");
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } else {
      throw new Error("Socket reconnection failed");
    }
  } catch (error) {
    console.error("❌ Error reconnecting socket:", error);
    
    if (onError) {
      onError(error);
    }
    
    return false;
  }
};

/**
 * Disconnect socket
 * @param {Object} options - Configuration options
 * @param {Function} options.dispatch - Redux dispatch function
 * @param {Function} options.disconnectSocket - Redux action to disconnect socket
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Promise<boolean>} - Returns true if disconnected successfully
 */
export const disconnectSocketUtil = async ({
  dispatch,
  disconnectSocket,
  onSuccess,
  onError
}) => {
  try {
    console.log("🔌 Disconnecting socket...");
    
    await dispatch(disconnectSocket());
    
    console.log("✅ Socket disconnected successfully");
    
    if (onSuccess) {
      onSuccess();
    }
    
    return true;
  } catch (error) {
    console.error("❌ Error disconnecting socket:", error);
    
    if (onError) {
      onError(error);
    }
    
    return false;
  }
};

