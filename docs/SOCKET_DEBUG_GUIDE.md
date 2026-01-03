# 🐛 Socket Debug Guide

## 🎯 Common Issues & Solutions

### **1. ⚠️ "Socket not initialized"**

**Nguyên nhân:**
- Socket chưa được `init()` trước khi `emit()`
- Component mount trước khi socket connect

**Giải pháp:**

```javascript
// ✅ ĐÚNG: Đợi socket connect trước
useEffect(() => {
  const initSocket = async () => {
    if (!socket.connected) {
      await dispatch(connectSocket('admin'));
    }
    
    // Đợi socket sẵn sàng
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Bây giờ mới emit
    emitSocketEvent("EVENT_NAME", data);
  };
  
  initSocket();
}, []);

// ❌ SAI: Emit ngay lập tức
useEffect(() => {
  emitSocketEvent("EVENT_NAME", data); // Socket chưa init!
}, []);
```

**Check:**
```javascript
// Console sẽ hiển thị:
🔍 Checking socket status: false
🔌 Khởi tạo socket connection...
🔌 Redux: Connecting socket with role: admin
this.socket: null
✅ Socket connected with role: admin, ID: abc123
✅ Redux: Socket connected
✅ Redux state updated: connected = true
📂 Loaded room from localStorage: {...}
📤 Registering admin to room...
📤 Emit event: REGISTER_ROOM_ADMIN {...}
```

---

### **2. ❌ Redux state không tự động update khi socket disconnect**

**Nguyên nhân:**
- Redux state chỉ update khi dispatch action
- Socket có thể disconnect do network mà không có action nào được dispatch
- Không có event listeners để track socket connection changes

**Giải pháp:**

Setup socket event listeners để auto-update Redux state:

```javascript
// socket-reducer.js
export const setupSocketListeners = (store) => {
  const socket = socketClient.getInstance();

  if (socket) {
    // Listen connect event
    socket.on('connect', () => {
      store.dispatch(setConnected({
        connected: true,
        socketId: socket.id
      }));
    });

    // Listen disconnect event
    socket.on('disconnect', (reason) => {
      store.dispatch(setConnected({
        connected: false,
        socketId: null
      }));
    });
  }
};

// Component
useEffect(() => {
  const initSocket = async () => {
    if (!socket.connected) {
      await dispatch(connectSocket('admin'));

      // Setup listeners
      setupSocketListeners(store);
    }
  };

  initSocket();
}, [dispatch, store]);
```

**Check:**
```javascript
// Khi socket disconnect, console sẽ hiển thị:
❌ Socket disconnected. Reason: transport close
🔌 Socket disconnected event, updating Redux state. Reason: transport close
🔄 Redux: Manual update connected = false socketId = null

// Redux state tự động update:
{
  socket: {
    connected: false,
    socketId: null
  }
}
```

---

### **3. 🔄 Re-create Socket không hoạt động**

**Nguyên nhân:**
- Không có room
- Socket đang reconnecting

**Giải pháp:**

```javascript
const handleRecreateConnection = async () => {
  if (!currentRoom) {
    alert("Vui lòng tạo room trước!");
    return;
  }
  
  // 4-step process
  await dispatch(disconnectSocket());
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  await dispatch(connectSocket('admin'));
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  emitSocketEvent("REGISTER_ROOM_ADMIN", {
    room_id: currentRoom.room_id,
    uuid_desktop: currentRoom.uuid_desktop,
    permission: 9,
  });
};
```

---

### **4. 📂 localStorage không load**

**Nguyên nhân:**
- Data bị corrupt
- JSON parse error

**Giải pháp:**

```javascript
try {
  const savedRoom = localStorage.getItem("admin_room");
  if (savedRoom) {
    const roomData = JSON.parse(savedRoom);
    console.log("✅ Loaded room:", roomData);
  }
} catch (error) {
  console.error("❌ Error loading room:", error);
  localStorage.removeItem("admin_room"); // Clear corrupt data
}
```

**Check localStorage:**
```javascript
// Chrome DevTools > Application > Local Storage
// Key: admin_room
// Value: {"room_id":"...","uuid_desktop":"...","server_url":"..."}
```

---

## 🔍 Debug Checklist

### **Step 1: Check Socket Status**

```javascript
// Console
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socketClient.getSocketId());
console.log('Socket role:', socketClient.getRole());
```

**Expected:**
```
Socket connected: true
Socket ID: abc123xyz
Socket role: admin
```

---

### **Step 2: Check Redux State**

```javascript
// Console
console.log('Redux socket state:', store.getState().socket);
```

**Expected:**
```javascript
{
  connected: true,
  role: 'admin'
}
```

---

### **Step 3: Check localStorage**

```javascript
// Console
console.log('Saved room:', localStorage.getItem('admin_room'));
```

**Expected:**
```json
{
  "room_id": "1AZJM9JL8D",
  "uuid_desktop": "CO2GJ74NMD6M",
  "server_url": "http://localhost:6789",
  "permission": 9,
  "created_at": "2026-01-03T10:30:00.000Z"
}
```

---

### **Step 4: Check Server**

```bash
# Terminal
curl http://localhost:6789/socket.io/
```

**Expected:**
```json
{"code":0,"message":"Transport unknown"}
```

---

### **Step 5: Check Network**

**Chrome DevTools > Network > WS (WebSocket)**

**Expected:**
- Status: 101 Switching Protocols
- Type: websocket
- Messages: REGISTER_ROOM_ADMIN, RES_ROOM_ADMIN, etc.

---

## 📊 Console Log Flow

### **Normal Flow:**

```
1. 🔍 Checking socket status: false
2. 🔌 Khởi tạo socket connection...
3. 🔌 Redux: Connecting socket with role: admin
4. this.socket: null
5. ✅ Socket connected with role: admin, ID: abc123
6. ✅ Redux: Socket connected
7. ✅ Redux state updated: connected = true
8. 📂 Loaded room from localStorage: {...}
9. 📤 Registering admin to room...
10. 📤 Emit event: REGISTER_ROOM_ADMIN {...}
11. 📥 Received event: RES_ROOM_ADMIN {...}
```

### **Error Flow:**

```
1. 🔍 Checking socket status: false
2. 🔌 Khởi tạo socket connection...
3. 🔌 Redux: Connecting socket with role: admin
4. this.socket: null
5. ❌ Socket connection error: Error: xhr poll error
6. ⚠️ Socket not initialized. Call init() first.
```

---

## 🛠️ Debugging Tools

### **1. Redux DevTools**

```javascript
// Install: Redux DevTools Extension
// View: State > socket
{
  connected: true,
  role: 'admin'
}
```

### **2. Socket.IO DevTools**

```javascript
// Add to SocketClient.js
this.socket.onAny((event, ...args) => {
  console.log(`📥 Received event: ${event}`, args);
});
```

### **3. Network Monitor**

```javascript
// Chrome DevTools > Network > WS
// Filter: socket.io
// View: Messages tab
```

---

## 🔧 Quick Fixes

### **Fix 1: Clear localStorage**

```javascript
localStorage.removeItem('admin_room');
location.reload();
```

### **Fix 2: Force Reconnect**

```javascript
await dispatch(disconnectSocket());
await dispatch(connectSocket('admin'));
```

### **Fix 3: Reset Socket**

```javascript
socketClient.disconnect();
socketClient.init('admin').connect();
```

---

## 📝 Testing Commands

```javascript
// Test emit
emitSocketEvent("ADMIN_FETCH_CONN", {});

// Test room registration
emitSocketEvent("REGISTER_ROOM_ADMIN", {
  room_id: "TEST123456",
  uuid_desktop: "TESTDEVICE12",
  permission: 9,
});

// Test disconnect
emitSocketEvent("DISCONNECT_CLIENT", {
  socket_id: "abc123",
  room_id: "TEST123456",
});
```

---

## 🚨 Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Socket not initialized` | Socket chưa init | Gọi `init()` trước |
| `Socket disconnected` | Mất kết nối | Reconnect |
| `Transport unknown` | Server không nhận WebSocket | Check server config |
| `xhr poll error` | Network error | Check server running |
| `Error loading room` | localStorage corrupt | Clear localStorage |

---

**Last Updated:** 2026-01-03  
**Version:** 1.0.0

