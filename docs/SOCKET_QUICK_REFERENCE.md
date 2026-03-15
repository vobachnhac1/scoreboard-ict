# 📡 Socket.IO Quick Reference

## 🚀 Quick Start

### 1. Init Socket Connection

```javascript
import socketClient from "./config/socket/socketClient";

// Init socket với role
socketClient.init("admin");
```

### 2. Register Admin to Room

```javascript
import { emitSocketEvent } from "./config/hooks/useSocketEvents";

emitSocketEvent("REGISTER_ROOM_ADMIN", {
  room_id: "1AZJM9JL8D",
  uuid_desktop: "CO2GJ74NMD6M",
  permission: 9,
});
```

### 3. Listen for Responses

```javascript
import { useSocketEvent } from "./config/hooks/useSocketEvents";

useSocketEvent("RES_ROOM_ADMIN", (response) => {
  console.log("Response:", response);
  // Handle response
});
```

---

## 📡 Socket Events Cheat Sheet

### **Admin → Server**

| Event                 | Payload                               | Description            |
| --------------------- | ------------------------------------- | ---------------------- |
| `REGISTER_ROOM_ADMIN` | `{room_id, uuid_desktop, permission}` | Đăng ký admin vào room |
| `ADMIN_FETCH_CONN`    | `{}`                                  | Lấy danh sách thiết bị |
| `APPROVED`            | `{socket_id, room_id}`                | Phê duyệt thiết bị     |
| `REJECTED`            | `{socket_id, room_id}`                | Từ chối thiết bị       |
| `DISCONNECT_CLIENT`   | `{socket_id, room_id}`                | Ngắt kết nối thiết bị  |
| `SEND_NOTIFICATION`   | `{socket_id, message}`                | Gửi thông báo          |

### **Server → Admin**

| Event            | Payload                | Description      |
| ---------------- | ---------------------- | ---------------- |
| `RES_ROOM_ADMIN` | `{status, data, path}` | Response chung   |
| `RES_MSG`        | `{status, message}`    | Response message |

---

## 🎯 Common Actions

### **Fetch Devices**

```javascript
const handleRefresh = () => {
  setLoading(true);
  emitSocketEvent("ADMIN_FETCH_CONN", {});
};

useSocketEvent("RES_ROOM_ADMIN", (response) => {
  if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
    const devices = Object.values(response.data.ls_conn);
    setData(devices);
    setLoading(false);
  }
});
```

### **Approve Device**

```javascript
const handleApprove = (row) => {
  emitSocketEvent("APPROVED", {
    socket_id: row.socket_id,
    room_id: row.room_id,
  });
};
```

### **Disconnect Device**

```javascript
const handleDisconnect = (row) => {
  emitSocketEvent("DISCONNECT_CLIENT", {
    socket_id: row.socket_id,
    room_id: row.room_id,
  });
};
```

### **Send Notification**

```javascript
const handleNotification = (row, message) => {
  emitSocketEvent("SEND_NOTIFICATION", {
    socket_id: row.socket_id,
    message: message,
  });
};
```

---

##  Data Structures

### **Device Object**

```javascript
{
  order: 1,
  device_name: "iPhone 13 Pro",
  judge_permission: "GD1",
  device_code: "CO2GJ74NMD6M",
  device_ip: "192.168.1.100",
  status: "active",           // active | inactive
  accepted: "approved",       // approved | pending | rejected | admin
  socket_id: "abc123xyz",
  room_id: "1AZJM9JL8D",
  permission: 9,
  token: "jwt_token_here"
}
```

### **Response Object**

```javascript
{
  status: 200,
  path: "ADMIN_FETCH_CONN",
  data: {
    ls_conn: {
      "socket_id_1": { device_name, ... },
      "socket_id_2": { device_name, ... }
    }
  }
}
```

---

## 🎨 Status Mapping

### **Connection Status**

```javascript
const status = conn.connect_status_code === "CONNECTED" ? "active" : "inactive";
```

### **Register Status**

```javascript
const accepted =
  conn.register_status_code === "CONNECTED"
    ? "approved"
    : conn.register_status_code === "PROCESSING"
      ? "pending"
      : conn.register_status_code === "ADMIN"
        ? "admin"
        : "rejected";
```

### **Judge Permission**

```javascript
const judge_permission = conn.referrer ? `GD${conn.referrer}` : "Chưa gán";
```

---

## Utility Functions

```javascript
import Utils from "./common/Utils";

// Get labels
Utils.getJudgePermissionLabel("GD1"); // => "Giám định 1"
Utils.getStatusLabel("active"); // => "Đang kết nối"
Utils.getApprovalStatusLabel("approved"); // => "Đã duyệt"
```

---

## Best Practices

1.  **Always check socket connection** before emitting
2.  **Cleanup listeners** on component unmount
3.  **Handle loading states** when emitting events
4.  **Validate socket_id and room_id** before actions
5.  **Refresh data** after each action
6.  **Handle errors** from server responses
7.  **Use unique room_id** for each session

---

## 🐛 Debugging

### **Check Socket Connection**

```javascript
console.log("Connected:", socketClient.isConnected());
console.log("Socket:", socketClient.getInstance());
```

### **Log All Events**

```javascript
useSocketEvent("RES_ROOM_ADMIN", (response) => {
  console.log("RES_ROOM_ADMIN:", response);
});

useSocketEvent("RES_MSG", (data) => {
  console.log("RES_MSG:", data);
});
```

### **Test Emit**

```javascript
emitSocketEvent("ADMIN_FETCH_CONN", {});
console.log("Emitted ADMIN_FETCH_CONN");
```

---

## 📝 Constants

```javascript
// Action types
Constants.ACTION_CONNECT_KH; // "KH"  - Kích hoạt
Constants.ACTION_CONNECT_GD; // "GD"  - Giám định
Constants.ACTION_CONNECT_DIS; // "DIS" - Disconnect
Constants.ACTION_CONNECT_MSG; // "MSG" - Message
Constants.ACTION_UPDATE; // "update"

// Status
LIST_STATUS = [
  { key: "active", label: "Đang kết nối" },
  { key: "inactive", label: "Ngắt kế nối" },
];

// Approval Status
LIST_APPROVAL_STATUS = [
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
  { key: "pending", label: "Chờ duyệt" },
];

// Judge Permission
LIST_JUDGE_PRORMISSION = [
  { key: "GD1", label: "Giám định 1" },
  { key: "GD2", label: "Giám định 2" },
  // ... GD3 to GD7
];
```

---

## 🔗 Related Files

- `app/views/Management/Connect/index.jsx` - Main component
- `app/config/hooks/useSocketEvents.js` - Socket hooks
- `app/config/socket/socketClient.js` - Socket client
- `app/common/Constants.js` - Constants
- `app/common/Utils.js` - Utility functions
- `app/views/Management/Connect/Forms/` - Action forms

---

## 📚 Full Documentation

See [SOCKET_MANAGEMENT_ANALYSIS.md](./SOCKET_MANAGEMENT_ANALYSIS.md) for detailed analysis.
