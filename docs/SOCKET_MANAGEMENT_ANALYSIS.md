# 📡 Phân tích ManagementConnectionSocket Component

## 📋 Tổng quan

**ManagementConnectionSocket** là component quản lý kết nối Socket.IO giữa Admin (Desktop) và các thiết bị Mobile (Giám định viên). Component này cho phép:

- ✅ Xem danh sách thiết bị đã kết nối
- ✅ Phê duyệt/Từ chối kết nối thiết bị
- ✅ Gán quyền giám định cho thiết bị
- ✅ Ngắt kết nối thiết bị
- ✅ Gửi thông báo đến thiết bị
- ✅ Cập nhật thông tin thiết bị

---

## 🏗️ Kiến trúc Socket.IO

### 1. **SocketClient Singleton**

```javascript
// app/config/socket/socketClient.js
class SocketClient {
  constructor() {
    this.socket = null;
  }

  init(role = 'guest') {
    if (!this.socket) {
      this.socket = io('http://localhost:6789', {
        autoConnect: true,
        transports: ['websocket'],
        query: { role },
      });
    }
    return this;
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
}
```

**Tính năng:**
- ✅ **Singleton pattern** - Chỉ có 1 instance duy nhất
- ✅ **Auto connect** - Tự động kết nối khi init
- ✅ **WebSocket transport** - Sử dụng WebSocket protocol
- ✅ **Role-based** - Gửi role khi connect (guest, admin, judge)

---

### 2. **Custom Hooks**

```javascript
// app/config/hooks/useSocketEvents.js

// Hook lắng nghe event từ server
export function useSocketEvent(event, callback) {
  useEffect(() => {
    socketClient.on(event, callback);
    return () => {
      socketClient.off(event, callback); // Cleanup
    };
  }, [event, callback]);
}

// Function emit event đến server
export function emitSocketEvent(event, data) {
  socketClient.emit(event, data);
}
```

**Tính năng:**
- ✅ **useSocketEvent** - Hook lắng nghe event, auto cleanup khi unmount
- ✅ **emitSocketEvent** - Function gửi event đến server
- ✅ **Type-safe** - Có thể thêm TypeScript types

---

## 🔄 Luồng hoạt động Socket

### **Flow Diagram**

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Admin     │                    │   Server    │                    │   Mobile    │
│  (Desktop)  │                    │  Socket.IO  │                    │  (Judge)    │
└──────┬──────┘                    └──────┬──────┘                    └──────┬──────┘
       │                                  │                                  │
       │  1. REGISTER_ROOM_ADMIN          │                                  │
       │─────────────────────────────────>│                                  │
       │     {room_id, uuid_desktop}      │                                  │
       │                                  │                                  │
       │  2. RES_ROOM_ADMIN               │                                  │
       │<─────────────────────────────────│                                  │
       │     {status: 200, data: {...}}   │                                  │
       │                                  │                                  │
       │                                  │  3. REGISTER_ROOM_MOBILE         │
       │                                  │<─────────────────────────────────│
       │                                  │     {room_id, device_info}       │
       │                                  │                                  │
       │  4. RES_ROOM_ADMIN               │                                  │
       │<─────────────────────────────────│                                  │
       │     {ls_conn: [...new device]}   │                                  │
       │                                  │                                  │
       │  5. ADMIN_FETCH_CONN             │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │  6. RES_ROOM_ADMIN               │                                  │
       │<─────────────────────────────────│                                  │
       │     {ls_conn: [...all devices]}  │                                  │
       │                                  │                                  │
       │  7. APPROVED                     │                                  │
       │─────────────────────────────────>│                                  │
       │     {socket_id, room_id}         │                                  │
       │                                  │                                  │
       │                                  │  8. RES_MSG                      │
       │                                  │─────────────────────────────────>│
       │                                  │     {status: "approved"}         │
       │                                  │                                  │
       │  9. DISCONNECT_CLIENT            │                                  │
       │─────────────────────────────────>│                                  │
       │     {socket_id, room_id}         │                                  │
       │                                  │                                  │
       │                                  │  10. disconnect                  │
       │                                  │─────────────────────────────────>│
       │                                  │                                  │
```

---

## 📡 Socket Events

### **1. Admin → Server Events**

| Event | Payload | Mô tả |
|-------|---------|-------|
| `REGISTER_ROOM_ADMIN` | `{room_id, uuid_desktop, permission}` | Đăng ký admin vào room |
| `ADMIN_FETCH_CONN` | `{}` | Lấy danh sách thiết bị |
| `APPROVED` | `{socket_id, room_id}` | Phê duyệt thiết bị |
| `REJECTED` | `{socket_id, room_id}` | Từ chối thiết bị |
| `DISCONNECT_CLIENT` | `{socket_id, room_id}` | Ngắt kết nối thiết bị |
| `SEND_NOTIFICATION` | `{socket_id, message}` | Gửi thông báo |

### **2. Server → Admin Events**

| Event | Payload | Mô tả |
|-------|---------|-------|
| `RES_ROOM_ADMIN` | `{status, data, path}` | Response chung cho admin |
| `RES_MSG` | `{status, message}` | Response message |

---

## 📊 Data Structure

### **Device Connection Object**

```javascript
{
  // Thông tin hiển thị
  order: 1,                           // STT
  device_name: "iPhone 13 Pro",       // Tên thiết bị
  judge_permission: "GD1",            // Quyền giám định
  device_code: "CO2GJ74NMD6M",        // Mã thiết bị
  device_ip: "192.168.1.100",         // IP thiết bị
  status: "active",                   // Trạng thái kết nối
  accepted: "approved",               // Trạng thái phê duyệt
  
  // Thông tin socket
  socket_id: "abc123xyz",             // Socket ID
  room_id: "1AZJM9JL8D",             // Room ID
  permission: 9,                      // Permission level
  token: "jwt_token_here",            // Auth token
  
  // Raw data từ server
  rawData: {
    device_name: "...",
    client_ip: "...",
    connect_status_code: "CONNECTED",
    register_status_code: "PROCESSING",
    referrer: 1,                      // Số thứ tự giám định
    // ... other fields
  }
}
```

---

## 🎯 Component Actions

### **1. Kích hoạt thiết bị (KH)**

```javascript
{
  key: Constants.ACTION_CONNECT_KH,
  titleModal: "Kích hoạt thiết bị",
  color: "bg-[#FAD7AC]",
  callback: (row) => {
    if (row.socket_id && row.room_id) {
      emitSocketEvent("APPROVED", {
        socket_id: row.socket_id,
        room_id: row.room_id
      });
    }
  }
}
```

**Flow:**
1. User click nút "KH"
2. Emit event `APPROVED` với socket_id và room_id
3. Server phê duyệt thiết bị
4. Server gửi `RES_ROOM_ADMIN` với danh sách cập nhật
5. UI refresh với trạng thái mới

---

### **2. Đăng ký giám định (GD)**

```javascript
{
  key: Constants.ACTION_CONNECT_GD,
  titleModal: "Đăng ký giám định",
  color: "bg-[#FAD9D5]",
  callback: (row) => {
    setOpenActions({ 
      isOpen: true, 
      key: Constants.ACTION_CONNECT_GD, 
      row: row 
    });
  }
}
```

**Flow:**
1. User click nút "GD"
2. Mở modal với QR code
3. Mobile scan QR để đăng ký quyền giám định
4. Server cập nhật permission
5. UI refresh

---

### **3. Ngắt kết nối (DIS)**

```javascript
{
  key: Constants.ACTION_CONNECT_DIS,
  titleModal: "Ngắt kết nối",
  color: "bg-[#B0E3E6]",
  callback: (row) => {
    setOpenActions({ 
      isOpen: true, 
      key: Constants.ACTION_CONNECT_DIS, 
      row: row 
    });
  }
}
```

**DisconnectForm Options:**
- ✅ Tạm ngưng chấm điểm
- ✅ Ngắt quyền giám định
- ✅ Ngắt kết nối hệ thống
- ✅ Huỷ kích hoạt thiết bị

**Flow:**
1. User click nút "DIS"
2. Mở modal DisconnectForm
3. User chọn options và confirm
4. Emit `DISCONNECT_CLIENT`
5. Server ngắt kết nối thiết bị
6. UI refresh

---

### **4. Gửi thông báo (MSG)**

```javascript
{
  key: Constants.ACTION_CONNECT_MSG,
  titleModal: "Gửi thông báo",
  color: "bg-[#50d71e]",
  callback: (row) => {
    setOpenActions({ 
      isOpen: true, 
      key: Constants.ACTION_CONNECT_MSG, 
      row: row 
    });
  }
}
```

**NotificationForm Fields:**
- 📝 Message (textarea, max 250 chars)
- ⚠️ Nhắc nhở (checkbox)
- 🚨 Cảnh cáo (checkbox)

**Flow:**
1. User click nút "MSG"
2. Mở modal NotificationForm
3. User nhập message và chọn type
4. Emit `SEND_NOTIFICATION`
5. Server gửi notification đến mobile
6. Mobile hiển thị notification

---

## 🔍 Response Handler

```javascript
useSocketEvent("RES_ROOM_ADMIN", (response) => {
  console.log("Receive from server:", response);

  // Response structure:
  // {
  //   status: 200,
  //   path: "ADMIN_FETCH_CONN",
  //   data: {
  //     ls_conn: {
  //       "socket_id_1": { device_name, ... },
  //       "socket_id_2": { device_name, ... },
  //     }
  //   }
  // }

  if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
    const deviceList = response.data.ls_conn || {};
    const devices = Object.values(deviceList).map((conn, index) => ({
      order: index + 1,
      device_name: conn.device_name || `Thiết bị ${conn.socket_id?.substring(0, 8)}`,
      judge_permission: conn.referrer ? `GD${conn.referrer}` : "Chưa gán",
      device_code: conn.device_id || conn.socket_id,
      device_ip: conn.client_ip || "N/A",
      status: conn.connect_status_code === "CONNECTED" ? "active" : "inactive",
      accepted: conn.register_status_code === "CONNECTED" ? "approved"
              : conn.register_status_code === "PROCESSING" ? "pending"
              : conn.register_status_code === "ADMIN" ? "admin"
              : "rejected",
      socket_id: conn.socket_id,
      room_id: conn.room_id,
      permission: conn.permission,
      token: conn.token,
      rawData: conn
    }));

    setData(devices);
    setLoading(false);
  }
});
```

---

## 📊 Status Mapping

### **Connection Status**

| Server Code | UI Status | Label |
|-------------|-----------|-------|
| `CONNECTED` | `active` | Đang kết nối |
| `DISCONNECTED` | `inactive` | Ngắt kết nối |

### **Register Status**

| Server Code | UI Status | Label |
|-------------|-----------|-------|
| `CONNECTED` | `approved` | Đã duyệt |
| `PROCESSING` | `pending` | Chờ duyệt |
| `ADMIN` | `admin` | Admin |
| `REJECTED` | `rejected` | Từ chối |

### **Judge Permission**

| Referrer | Permission | Label |
|----------|------------|-------|
| `1` | `GD1` | Giám định 1 |
| `2` | `GD2` | Giám định 2 |
| `3` | `GD3` | Giám định 3 |
| `...` | `...` | ... |
| `7` | `GD7` | Giám định 7 |

---

## 🎨 UI Components

### **1. CustomTable**

```javascript
<CustomTable
  columns={columns}
  data={data}
  loading={loading}
  page={page}
  onPageChange={setPage}
  onRowDoubleClick={(row) => {
    setOpenActions({ 
      isOpen: true, 
      key: Constants.ACTION_UPDATE, 
      row: row 
    });
  }}
/>
```

**Columns:**
1. STT
2. Tên thiết bị
3. Quyền giám định
4. Mã thiết bị
5. IP thiết bị
6. Trạng thái
7. Chấp thuận
8. Actions (KH, GD, DIS, MSG)

---

### **2. Modal Actions**

```javascript
<Modal
  isOpen={openActions?.isOpen || false}
  onClose={() => setOpenActions({ ...openActions, isOpen: false })}
  title={listActions.find((e) => e.key === openActions?.key)?.titleModal}
  headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
>
  {renderContentModal(openActions)}
</Modal>
```

**Modal Types:**
- 📱 **KH** - QR Code kích hoạt
- 👨‍⚖️ **GD** - QR Code đăng ký giám định
- 🔌 **DIS** - DisconnectForm
- 💬 **MSG** - NotificationForm
- ✏️ **UPDATE** - UpdateForm (double click row)

---

## 🔧 Utility Functions

### **Utils.js**

```javascript
// Lấy label quyền giám định
Utils.getJudgePermissionLabel("GD1") // => "Giám định 1"

// Lấy label trạng thái
Utils.getStatusLabel("active") // => "Đang kết nối"

// Lấy label phê duyệt
Utils.getApprovalStatusLabel("approved") // => "Đã duyệt"
```

---

## 🚀 Cách sử dụng

### **1. Khởi tạo kết nối Admin**

```javascript
const handleInitConnection = () => {
  emitSocketEvent("REGISTER_ROOM_ADMIN", {
    room_id: "1AZJM9JL8D",        // Room ID (tự tạo hoặc từ DB)
    uuid_desktop: "CO2GJ74NMD6M",  // UUID desktop (unique)
    permission: 9,                 // Admin permission level
  });
};
```

### **2. Fetch danh sách thiết bị**

```javascript
const handleRefresh = () => {
  setLoading(true);
  emitSocketEvent("ADMIN_FETCH_CONN", {});
};
```

### **3. Phê duyệt thiết bị**

```javascript
emitSocketEvent("APPROVED", {
  socket_id: row.socket_id,
  room_id: row.room_id
});
```

### **4. Ngắt kết nối thiết bị**

```javascript
emitSocketEvent("DISCONNECT_CLIENT", {
  socket_id: row.socket_id,
  room_id: row.room_id
});
```

---

## ⚠️ Lưu ý quan trọng

1. ✅ **Socket connection** phải được init trước khi sử dụng
2. ✅ **Room ID** phải unique cho mỗi phiên thi đấu
3. ✅ **Socket ID** được server tự generate khi client connect
4. ✅ **Cleanup** socket listeners khi component unmount
5. ✅ **Error handling** cho các socket events
6. ✅ **Loading states** khi emit events
7. ✅ **Refresh** danh sách sau mỗi action

---

## 🐛 Troubleshooting

### **Không nhận được response từ server**

```javascript
// Check socket connection
console.log("Socket connected:", socketClient.isConnected());

// Check event listener
useSocketEvent("RES_ROOM_ADMIN", (response) => {
  console.log("Response:", response);
});
```

### **Thiết bị không hiển thị trong danh sách**

```javascript
// Emit ADMIN_FETCH_CONN để refresh
emitSocketEvent("ADMIN_FETCH_CONN", {});

// Check response data structure
console.log("Device list:", response.data.ls_conn);
```

### **Action không hoạt động**

```javascript
// Check socket_id và room_id
console.log("Socket ID:", row.socket_id);
console.log("Room ID:", row.room_id);

// Check event emit
emitSocketEvent("APPROVED", {
  socket_id: row.socket_id,
  room_id: row.room_id
});
```

---

## 📝 TODO / Improvements

- [ ] Add TypeScript types cho socket events
- [ ] Add error handling cho socket errors
- [ ] Add reconnection logic
- [ ] Add heartbeat/ping-pong
- [ ] Add socket connection status indicator
- [ ] Add real-time updates (không cần refresh)
- [ ] Add pagination cho danh sách thiết bị
- [ ] Add search/filter thiết bị
- [ ] Add export danh sách thiết bị
- [ ] Add socket event logging

---

## 📚 References

- Socket.IO Client: https://socket.io/docs/v4/client-api/
- React Hooks: https://react.dev/reference/react
- Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks

