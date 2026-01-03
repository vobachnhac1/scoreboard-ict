# 📱 Mobile Client Socket.IO Protocol

## 📋 Tổng quan

Tài liệu mô tả gói tin chuẩn để client mobile (thiết bị giám định) thực hiện kết nối với Socket.IO server.

---

## 🔌 Connection Flow

```
Mobile App Start
  ↓
1. Connect to Socket.IO Server
  ↓
2. Receive INIT response
  ↓
3. Emit REGISTER event
  ↓
4. Wait for APPROVED from Admin
  ↓
5. Receive token → Ready to send scores
```

---

## 📡 Socket Events

### **1. Connection (Auto)**

Khi mobile app kết nối đến server, server tự động gửi response:

**Server → Mobile:**

```javascript
// Event: RES_MSG
{
  type: "INIT",
  status: 200,
  message: "Kết nối thành công",
  data: {
    room_id: null,
    client_ip: null,
    uuid_desktop: null,
    device_id: null,
    device_name: null,
    connect_status_code: null,
    connect_status_name: null,
    register_status_code: null,
    register_status_name: null,
    referrer: 0,
    socket_id: "abc123xyz",  // Server generated
    permission: 0,
    token: null
  }
}
```

---

### **2. Register to Room**

Mobile gửi thông tin đăng ký vào room (sau khi scan QR code).

**Mobile → Server:**

```javascript
// Event: REGISTER
socket.emit("REGISTER", {
  room_id: "1AZJM9JL8D",        // From QR code
  referrer: 1,                  // Judge position (1-7)
  device_id: "CO2GJ74NMD6M",    // Device unique ID
  device_name: "iPhone 13 Pro"  // Optional
});
```

**Server → Mobile:**

```javascript
// Event: RES_MSG
{
  type: "REGISTER",
  status: 200,
  message: "Đăng ký thành công, chờ phê duyệt",
  data: {
    room_id: "1AZJM9JL8D",
    referrer: 1,
    device_id: "CO2GJ74NMD6M",
    device_name: "iPhone 13 Pro",
    socket_id: "abc123xyz",
    permission: 1,
    connect_status_code: "CONNECTED",
    connect_status_name: "Đã kết nối",
    register_status_code: "PROCESSING",
    register_status_name: "Đã kết nối và chờ duyệt",
    token: null  // Chưa được phê duyệt
  }
}
```

**Server → Admin (broadcast to room):**

```javascript
// Event: RES_ROOM_ADMIN
{
  status: 200,
  message: "Thực hiện thành công",
  data: {
    room_id: "1AZJM9JL8D",
    ls_conn: {
      "abc123xyz": {
        room_id: "1AZJM9JL8D",
        device_id: "CO2GJ74NMD6M",
        device_name: "iPhone 13 Pro",
        referrer: 1,
        socket_id: "abc123xyz",
        connect_status_code: "CONNECTED",
        register_status_code: "PROCESSING",
        permission: 1,
        token: null
      }
    }
  }
}
```

---

### **3. Admin Approves Connection**

Admin phê duyệt kết nối từ desktop.

**Admin → Server:**

```javascript
// Event: APPROVED
socket.emit("APPROVED", {
  socket_id: "abc123xyz",
  room_id: "1AZJM9JL8D"
});
```

**Server → Mobile:**

```javascript
// Event: RES_MSG
{
  type: "APPROVE_CONNECT",
  status: 200,
  message: "Đã phê duyệt kết nối",
  data: {
    room_id: "1AZJM9JL8D",
    device_id: "CO2GJ74NMD6M",
    device_name: "iPhone 13 Pro",
    referrer: 0,  // Reset to 0 after approval
    socket_id: "abc123xyz",
    connect_status_code: "CONNECTED",
    connect_status_name: "Đã kết nối",
    register_status_code: "CONNECTED",
    register_status_name: "Đã kết nối và được duyệt",
    permission: 1,
    token: "a1b2c3d4e5f6..."  // ✅ Token generated
  }
}
```

**✅ Mobile is now APPROVED and can send scores!**

---

### **4. Send Score (After Approved)**

Mobile gửi điểm số khi giám định viên chấm điểm.

**Mobile → Server:**

```javascript
// Event: REQ_MSG
socket.emit("REQ_MSG", {
  key: "a1b2c3d4e5f6...",  // Token from approval
  score: {
    blue: 1,  // Điểm xanh: 0, 1, 2, 3
    red: 0    // Điểm đỏ: 0, 1, 2, 3
  }
});
```

**Server Logic:**
- Nhận điểm từ tất cả giám định viên trong 1 giây
- Nếu ≥ 2/3 giám định viên chấm cùng điểm → Cộng điểm
- Broadcast điểm mới đến tất cả clients

---

### **5. Admin Rejects Connection**

Admin từ chối kết nối.

**Admin → Server:**

```javascript
// Event: REJECTED
socket.emit("REJECTED", {
  socket_id: "abc123xyz",
  room_id: "1AZJM9JL8D"
});
```

**Server → Mobile:**

```javascript
// Event: RES_MSG
{
  type: "APPROVE_CONNECT",
  status: 200,
  message: "Đã từ chối kết nối",
  data: {
    connect_status_code: "CONNECTED",
    register_status_code: "PROCESSING",
    permission: 0,
    token: null  // ❌ No token
  }
}
```

---

### **6. Admin Disconnects Client**

Admin ngắt kết nối thiết bị.

**Admin → Server:**

```javascript
// Event: DISCONNECT_CLIENT
socket.emit("DISCONNECT_CLIENT", {
  socket_id: "abc123xyz",
  room_id: "1AZJM9JL8D"
});
```

**Server → Mobile:**

```javascript
// Event: RES_MSG
{
  type: "DISCONNECT_CLIENT",
  status: 200,
  message: "Đã ngắt kết nối client",
  data: null
}
```

**Server disconnects mobile after 1 second.**

---

## 📊 Data Structures

### **Mobile Device Object (Full)**

```javascript
{
  // Room & Device Info
  room_id: "1AZJM9JL8D",           // Room ID (from QR)
  device_id: "CO2GJ74NMD6M",       // Device unique ID
  device_name: "iPhone 13 Pro",    // Device name
  client_ip: "192.168.1.100",      // Client IP (auto)
  uuid_desktop: null,              // Desktop UUID (admin only)
  
  // Socket Info
  socket_id: "abc123xyz",          // Socket ID (auto)
  permission: 1,                   // 0: guest, 1: judge, 9: admin
  token: "a1b2c3d4e5f6...",        // Auth token (after approval)
  
  // Judge Info
  referrer: 1,                     // Judge position (1-7)
  
  // Connection Status
  connect_status_code: "CONNECTED",      // CONNECTED | DISCONNECT
  connect_status_name: "Đã kết nối",
  
  // Registration Status
  register_status_code: "CONNECTED",     // PROCESSING | CONNECTED | DISCONNECT
  register_status_name: "Đã kết nối và được duyệt"
}
```

---

## 🔄 Status Codes

### **Connection Status (connect_status_code)**

| Code | Name | Meaning |
|------|------|---------|
| `CONNECTED` | Đã kết nối | Socket connected |
| `DISCONNECT` | Ngắt kết nối | Socket disconnected |

### **Registration Status (register_status_code)**

| Code | Name | Meaning |
|------|------|---------|
| `PROCESSING` | Đã kết nối và chờ duyệt | Waiting for admin approval |
| `CONNECTED` | Đã kết nối và được duyệt | Approved by admin |
| `DISCONNECT` | Ngắt kết nối | Disconnected |
| `ADMIN` | ADMIN | Admin connection |

### **Permission Levels**

| Level | Role | Description |
|-------|------|-------------|
| `0` | Guest | No permission |
| `1` | Judge | Can send scores |
| `9` | Admin | Full control |

### **Referrer (Judge Position)**

| Value | Position | Description |
|-------|----------|-------------|
| `0` | None | Not assigned |
| `1` | GD1 | Giám định 1 |
| `2` | GD2 | Giám định 2 |
| `3` | GD3 | Giám định 3 |
| `4` | GD4 | Giám định 4 |
| `5` | GD5 | Giám định 5 |
| `6` | GD6 | Giám định 6 (Admin) |
| `7` | GD7 | Giám định 7 |

---

## 📝 Response Types

### **RES_TYPE**

| Type | Description |
|------|-------------|
| `INIT` | Initial connection response |
| `REGISTER` | Registration response |
| `APPROVE_CONNECT` | Approval/Rejection response |
| `REJECT_CONNECT` | Rejection response |

---

## 🎯 Mobile Client Implementation Example

```javascript
import io from 'socket.io-client';

class MobileSocketClient {
  constructor() {
    this.socket = null;
    this.deviceInfo = null;
    this.token = null;
  }

  // 1. Connect to server
  connect() {
    this.socket = io('http://localhost:6789', {
      autoConnect: true,
      transports: ['websocket']
    });

    // Listen for INIT response
    this.socket.on('RES_MSG', (response) => {
      console.log('Response:', response);
      
      if (response.type === 'INIT') {
        this.deviceInfo = response.data;
        console.log('✅ Connected! Socket ID:', this.deviceInfo.socket_id);
      }
      
      if (response.type === 'REGISTER') {
        console.log('📝 Registered! Waiting for approval...');
      }
      
      if (response.type === 'APPROVE_CONNECT') {
        if (response.data.token) {
          this.token = response.data.token;
          console.log('✅ APPROVED! Token:', this.token);
        } else {
          console.log('❌ REJECTED!');
        }
      }
      
      if (response.type === 'DISCONNECT_CLIENT') {
        console.log('🔌 Disconnected by admin');
        this.socket.disconnect();
      }
    });
  }

  // 2. Register to room (after scan QR)
  register(qrData) {
    this.socket.emit('REGISTER', {
      room_id: qrData.room_id,
      referrer: qrData.referrer,
      device_id: this.getDeviceId(),
      device_name: this.getDeviceName()
    });
  }

  // 3. Send score (after approved)
  sendScore(blueScore, redScore) {
    if (!this.token) {
      console.error('❌ Not approved yet!');
      return;
    }

    this.socket.emit('REQ_MSG', {
      key: this.token,
      score: {
        blue: blueScore,
        red: redScore
      }
    });
  }

  // Helper methods
  getDeviceId() {
    // Get device unique ID
    return 'CO2GJ74NMD6M';
  }

  getDeviceName() {
    // Get device name
    return 'iPhone 13 Pro';
  }
}

// Usage
const client = new MobileSocketClient();
client.connect();

// After scan QR code
client.register({
  room_id: '1AZJM9JL8D',
  referrer: 1
});

// After approved, send score
client.sendScore(1, 0);  // Blue +1, Red +0
```

---

---

## 📱 QR Code Format

Mobile app cần scan QR code để lấy thông tin room và judge position.

### **QR Code Data Structure**

```json
{
  "room_id": "1AZJM9JL8D",
  "referrer": 1,
  "server_url": "http://localhost:6789"
}
```

hoặc dạng string:

```
scoreboard://connect?room_id=1AZJM9JL8D&referrer=1&server=http://localhost:6789
```

### **QR Code Generation (Admin)**

```javascript
import QRCode from 'qrcode';

const generateQRCode = async (roomId, judgePosition) => {
  const qrData = {
    room_id: roomId,
    referrer: judgePosition,
    server_url: 'http://localhost:6789'
  };

  const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
  return qrCodeDataURL;
};

// Generate QR for Judge 1
const qrCode = await generateQRCode('1AZJM9JL8D', 1);
```

### **QR Code Scanning (Mobile)**

```javascript
import { BarCodeScanner } from 'expo-barcode-scanner';

const scanQRCode = async () => {
  const { status } = await BarCodeScanner.requestPermissionsAsync();

  if (status === 'granted') {
    // Scan QR code
    const result = await BarCodeScanner.scanAsync();
    const qrData = JSON.parse(result.data);

    // Connect to server
    client.connect(qrData.server_url);

    // Register to room
    client.register({
      room_id: qrData.room_id,
      referrer: qrData.referrer
    });
  }
};
```

---

## 🔐 Security & Validation

### **Token Validation**

```javascript
// Mobile must include token in every REQ_MSG
socket.emit('REQ_MSG', {
  key: token,  // ✅ Required
  score: { blue: 1, red: 0 }
});

// Server validates token
if (!key) {
  socket.emit('RES_MSG', {
    status: 'error',
    message: 'Thiết bị chưa được xác thực'
  });
  return;
}
```

### **Room Validation**

```javascript
// Server checks if room exists
const roomExists = io.sockets.adapter.rooms.has(input.room_id);

if (!roomExists) {
  socket.emit('RES_MSG', {
    type: 'REGISTER',
    status: 400,
    message: 'Đăng ký không thành công. Vui lòng scanQR để tiếp tục'
  });
  return;
}
```

### **Duplicate Connection Check**

```javascript
// Server checks if device already has token
if (client.token) {
  io.to(input.socket_id).emit('RES_MSG', {
    status: 200,
    message: 'Đã phê duyệt kết nối',
    type: 'APPROVE_CONNECT',
    data: client
  });
  return;
}
```

---

## ⚠️ Error Handling

### **Common Errors**

| Error | Cause | Solution |
|-------|-------|----------|
| `Thiết bị chưa được xác thực` | No token in REQ_MSG | Wait for admin approval |
| `Đăng ký không thành công` | Room doesn't exist | Scan QR code again |
| `Đã ngắt kết nối client` | Admin disconnected | Reconnect and register |
| `Đã từ chối kết nối` | Admin rejected | Contact admin |

### **Mobile Error Handling**

```javascript
socket.on('RES_MSG', (response) => {
  if (response.status === 400 || response.status === 'error') {
    console.error('Error:', response.message);

    // Show error to user
    Alert.alert('Lỗi', response.message);

    // Handle specific errors
    if (response.message.includes('scanQR')) {
      // Navigate to QR scanner
      navigation.navigate('QRScanner');
    }
  }
});
```

---

## 🔄 Reconnection Strategy

### **Auto Reconnect**

```javascript
class MobileSocketClient {
  connect() {
    this.socket = io('http://localhost:6789', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected');

      // Re-register if we have room info
      if (this.roomInfo) {
        this.register(this.roomInfo);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
      this.token = null;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });
  }
}
```

---

## 📊 Testing

### **Test Connection Flow**

```javascript
// 1. Test connection
const client = new MobileSocketClient();
client.connect();

// 2. Test registration
setTimeout(() => {
  client.register({
    room_id: '1AZJM9JL8D',
    referrer: 1
  });
}, 1000);

// 3. Manually approve from admin panel

// 4. Test sending score
setTimeout(() => {
  client.sendScore(1, 0);
}, 5000);
```

### **Test with Multiple Devices**

```javascript
// Simulate 3 judges
const judge1 = new MobileSocketClient();
const judge2 = new MobileSocketClient();
const judge3 = new MobileSocketClient();

judge1.connect();
judge2.connect();
judge3.connect();

setTimeout(() => {
  judge1.register({ room_id: '1AZJM9JL8D', referrer: 1 });
  judge2.register({ room_id: '1AZJM9JL8D', referrer: 2 });
  judge3.register({ room_id: '1AZJM9JL8D', referrer: 3 });
}, 1000);

// After approval, all send same score
setTimeout(() => {
  judge1.sendScore(1, 0);
  judge2.sendScore(1, 0);
  judge3.sendScore(1, 0);
  // ✅ Blue team gets +1 point (2/3 consensus)
}, 10000);
```

---

## 📚 References

- Server Socket: `server/config/socket.js`
- Constants: `server/constants.js`
- Admin Client: `app/views/Management/Connect/index.jsx`
- Socket Hooks: `app/config/hooks/useSocketEvents.js`
- Socket Client: `app/config/socket/SocketClient.js`

---

## 📖 Related Documentation

- [SOCKET_QUICK_REFERENCE.md](./SOCKET_QUICK_REFERENCE.md) - Quick reference
- [SOCKET_MANAGEMENT_ANALYSIS.md](./SOCKET_MANAGEMENT_ANALYSIS.md) - Detailed analysis
- [SOCKET_CONTROL_BUTTONS.md](./SOCKET_CONTROL_BUTTONS.md) - Control buttons

