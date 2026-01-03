# 🚀 Socket.IO Initialization Guide

## 📋 Tổng quan

Hướng dẫn khởi tạo Socket.IO singleton khi mở ứng dụng web.

---

## 🏗️ Kiến trúc khởi tạo

```
App Start
  ↓
index.js (ReactDOM.render)
  ↓
App.js (useEffect)
  ↓
Redux: connectSocket('admin')
  ↓
socketClient.init('admin').connect()
  ↓
Socket.IO Connected ✅
```

---

## 📁 File Structure

```
app/
├── index.js                          # Entry point
├── App.js                            # Main App component
├── config/
│   ├── socket/
│   │   └── SocketClient.js           # Socket singleton class
│   ├── hooks/
│   │   └── useSocketEvents.js        # Custom hooks
│   ├── redux/
│   │   ├── store.js                  # Redux store
│   │   └── reducers/
│   │       └── socket-reducer.js     # Socket Redux slice
│   └── routes.js                     # Routes config
```

---

## 🔧 Implementation

### **1. SocketClient Singleton** (`app/config/socket/SocketClient.js`)

```javascript
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.role = null;
  }

  init(role = 'guest') {
    if (!this.socket) {
      this.role = role;
      this.socket = io('http://localhost:6789', {
        autoConnect: true,
        transports: ['websocket'],
        query: { role },
      });

      // Log connection events
      this.socket.on('connect', () => {
        console.log(`✅ Socket connected with role: ${role}, ID: ${this.socket.id}`);
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`❌ Socket disconnected. Reason: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });
    }
    return this;
  }

  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      console.log('🔄 Reconnecting socket...');
    }
    return this;
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      console.log('🔌 Socket disconnected');
    }
  }

  emit(event, payload) {
    if (this.socket) {
      this.socket.emit(event, payload);
      console.log(`📤 Emit event: ${event}`, payload);
    } else {
      console.warn('⚠️ Socket not initialized. Call init() first.');
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('⚠️ Socket not initialized. Call init() first.');
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected() {
    return !!this.socket?.connected;
  }

  getInstance() {
    return this.socket;
  }

  getSocketId() {
    return this.socket?.id;
  }

  getRole() {
    return this.role;
  }
}

// Export singleton instance
const socketClient = new SocketClient();
export default socketClient;
```

**Tính năng:**
- ✅ **Singleton pattern** - Chỉ có 1 instance duy nhất
- ✅ **Auto connect** - Tự động kết nối khi init
- ✅ **Role-based** - Gửi role khi connect (admin, judge, guest)
- ✅ **Event logging** - Log tất cả connection events
- ✅ **Error handling** - Handle connection errors
- ✅ **Reconnection** - Hỗ trợ reconnect

---

### **2. Redux Socket Slice** (`app/config/redux/reducers/socket-reducer.js`)

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import socketClient from '../../socket/SocketClient';

export const connectSocket = createAsyncThunk('socket/connect', async (role) => {
  console.log('Connecting socket with role:', role);
  socketClient.init(role).connect();
});

export const disconnectSocket = createAsyncThunk('socket/disconnect', async () => {
  socketClient.disconnect();
});

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    connected: false,
    role: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(connectSocket.fulfilled, (state, action) => {
      state.connected = true;
    });
    builder.addCase(disconnectSocket.fulfilled, (state, action) => {
      state.connected = false;
    });
  },
});

export default socketSlice.reducer;
```

**Tính năng:**
- ✅ **Redux Thunk** - Async actions
- ✅ **State management** - Track connection status
- ✅ **Lifecycle** - Connect/Disconnect actions

---

### **3. App Component** (`app/App.js`)

```javascript
import React, { useEffect } from 'react';
import Routes from './config/routes';
import { HashRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket } from './config/redux/reducers/socket-reducer';

const App = () => {
  const dispatch = useDispatch();
  const connectionStatus = useSelector((state) => state.socket.connected);

  useEffect(() => {
    // Khởi tạo socket khi app start
    if (!connectionStatus) {
      dispatch(connectSocket('admin'));
    }

    // Cleanup khi app unmount
    return () => {
      dispatch(disconnectSocket());
    };
  }, []);

  return (
    <HashRouter>
      <Routes />
    </HashRouter>
  );
};

export default App;
```

**Flow:**
1. App component mount
2. Check `connectionStatus` từ Redux
3. Nếu chưa connect → dispatch `connectSocket('admin')`
4. Redux thunk gọi `socketClient.init('admin').connect()`
5. Socket.IO kết nối đến server
6. Log `✅ Socket connected with role: admin, ID: xxx`
7. Khi app unmount → dispatch `disconnectSocket()`

---

### **4. Custom Hooks** (`app/config/hooks/useSocketEvents.js`)

```javascript
import { useEffect } from 'react';
import socketClient from '../socket/SocketClient';

// Hook lắng nghe event từ server
export function useSocketEvent(event, callback) {
  useEffect(() => {
    socketClient.on(event, callback);
    return () => {
      socketClient.off(event, callback); // Auto cleanup
    };
  }, [event, callback]);
}

// Function emit event đến server
export function emitSocketEvent(event, data) {
  socketClient.emit(event, data);
}
```

**Usage:**

```javascript
import { useSocketEvent, emitSocketEvent } from './config/hooks/useSocketEvents';

// Lắng nghe event
useSocketEvent("RES_ROOM_ADMIN", (response) => {
  console.log("Response:", response);
});

// Emit event
emitSocketEvent("ADMIN_FETCH_CONN", {});
```

---

### **5. Export từ routes.js** (`app/config/routes.js`)

```javascript
import socketClient from './socket/SocketClient';

// Export socketClient để sử dụng ở các component khác
export { socketClient };
```

**Usage:**

```javascript
import { socketClient } from './config/routes';

// Check connection
console.log('Connected:', socketClient.isConnected());

// Get socket ID
console.log('Socket ID:', socketClient.getSocketId());
```

---

## 🔄 Luồng khởi tạo chi tiết

### **Step 1: App Start**

```
User opens app
  ↓
index.js renders <App />
  ↓
App.js useEffect runs
```

### **Step 2: Redux Dispatch**

```
dispatch(connectSocket('admin'))
  ↓
Redux Thunk executes
  ↓
socketClient.init('admin').connect()
```

### **Step 3: Socket.IO Connection**

```
socketClient.init('admin')
  ↓
Create socket instance with io()
  ↓
autoConnect: true → Connect immediately
  ↓
Server receives connection
  ↓
Client receives 'connect' event
  ↓
Log: ✅ Socket connected with role: admin, ID: xxx
```

### **Step 4: Ready to Use**

```
Socket connected ✅
  ↓
Components can use useSocketEvent()
  ↓
Components can use emitSocketEvent()
```

---

## 📊 Console Logs

Khi app start, bạn sẽ thấy logs sau trong console:

```
Connecting socket with role: admin
✅ Socket connected with role: admin, ID: abc123xyz
```

Khi emit event:

```
📤 Emit event: REGISTER_ROOM_ADMIN { room_id: '1AZJM9JL8D', uuid_desktop: 'CO2GJ74NMD6M', permission: 9 }
```

Khi disconnect:

```
🔌 Socket disconnected
❌ Socket disconnected. Reason: client namespace disconnect
```

---

## ⚠️ Lưu ý quan trọng

1. ✅ **Singleton pattern** - `socketClient` chỉ được khởi tạo 1 lần
2. ✅ **Auto connect** - Socket tự động connect khi init
3. ✅ **Cleanup** - Socket disconnect khi app unmount
4. ✅ **Redux state** - Track connection status trong Redux
5. ✅ **Error handling** - Log errors khi connection failed
6. ✅ **Reconnection** - Hỗ trợ reconnect nếu mất kết nối

---

## 🐛 Troubleshooting

### **Socket không connect**

```javascript
// Check socket instance
console.log('Socket:', socketClient.getInstance());

// Check connection status
console.log('Connected:', socketClient.isConnected());

// Check Redux state
const connectionStatus = useSelector((state) => state.socket.connected);
console.log('Redux connected:', connectionStatus);
```

### **Server không nhận được connection**

1. Kiểm tra server đang chạy: `http://localhost:6789`
2. Kiểm tra CORS settings
3. Kiểm tra firewall
4. Kiểm tra network tab trong DevTools

### **Multiple connections**

Nếu thấy nhiều connections:
1. Check `useEffect` dependencies
2. Check React.StrictMode (double render)
3. Check cleanup function

---

## 📚 References

- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Hooks](https://react.dev/reference/react)

