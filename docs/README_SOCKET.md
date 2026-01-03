# 📡 Socket.IO Documentation Hub

## 📚 Tổng quan tài liệu

Hệ thống tài liệu đầy đủ về Socket.IO protocol cho Scoreboard ICT system.

---

## 🎯 Dành cho ai?

### **👨‍💻 Mobile Developers**

Bạn đang phát triển mobile app cho giám định viên?

**Bắt đầu tại đây:**
1. 📱 [MOBILE_QUICK_START.md](./MOBILE_QUICK_START.md) - 5 phút integration
2. 📱 [MOBILE_CLIENT_PROTOCOL.md](./MOBILE_CLIENT_PROTOCOL.md) - Chi tiết protocol

**Bạn sẽ học được:**
- ✅ Cách kết nối đến Socket.IO server
- ✅ Cách scan QR code và đăng ký vào room
- ✅ Cách nhận token từ admin
- ✅ Cách gửi điểm số
- ✅ Error handling và reconnection

---

### **🖥️ Desktop/Web Developers**

Bạn đang phát triển admin panel hoặc scoreboard?

**Bắt đầu tại đây:**
1. 📊 [SUMMARY_SOCKET_FEATURES.md](./SUMMARY_SOCKET_FEATURES.md) - ⭐ **NEW** - Tổng hợp tất cả tính năng
2. 🏠 [CREATE_ROOM_FEATURE.md](./CREATE_ROOM_FEATURE.md) - ⭐ **NEW** - Tạo và quản lý room admin
3. 📡 [SOCKET_QUICK_REFERENCE.md](./SOCKET_QUICK_REFERENCE.md) - Quick reference
4. 📊 [SOCKET_MANAGEMENT_ANALYSIS.md](./SOCKET_MANAGEMENT_ANALYSIS.md) - Phân tích chi tiết
5. 🎛️ [SOCKET_CONTROL_BUTTONS.md](./SOCKET_CONTROL_BUTTONS.md) - Control buttons

**Bạn sẽ học được:**
- ✅ Cách tạo và quản lý room admin với QR code
- ✅ Cách quản lý kết nối thiết bị
- ✅ Cách phê duyệt/từ chối thiết bị
- ✅ Cách ngắt kết nối thiết bị
- ✅ Cách tạo lại socket connection
- ✅ Cách sử dụng Redux với Socket.IO

---

### **🔧 Backend Developers**

Bạn đang maintain hoặc mở rộng Socket.IO server?

**Bắt đầu tại đây:**
1. 📊 [SOCKET_MANAGEMENT_ANALYSIS.md](./SOCKET_MANAGEMENT_ANALYSIS.md) - Server logic
2. 📱 [MOBILE_CLIENT_PROTOCOL.md](./MOBILE_CLIENT_PROTOCOL.md) - Protocol spec
3. 📄 [SOCKET_PROTOCOL_SCHEMA.json](./SOCKET_PROTOCOL_SCHEMA.json) - JSON Schema

**Bạn sẽ học được:**
- ✅ Server architecture
- ✅ Event handlers
- ✅ Consensus algorithm (scoring)
- ✅ Room management
- ✅ Token generation

---

## 📖 Danh sách tài liệu

### **🚀 Quick Start**

| File | Mô tả | Dành cho |
|------|-------|----------|
| [MOBILE_QUICK_START.md](./MOBILE_QUICK_START.md) | 5-minute mobile integration | Mobile devs |
| [SOCKET_QUICK_REFERENCE.md](./SOCKET_QUICK_REFERENCE.md) | Quick reference cheat sheet | All devs |

### **📱 Mobile Client**

| File | Mô tả | Dành cho |
|------|-------|----------|
| [MOBILE_CLIENT_PROTOCOL.md](./MOBILE_CLIENT_PROTOCOL.md) | Complete mobile protocol | Mobile devs |
| [SOCKET_PROTOCOL_SCHEMA.json](./SOCKET_PROTOCOL_SCHEMA.json) | JSON Schema validation | Mobile/Backend |

### **🖥️ Desktop/Admin**

| File | Mô tả | Dành cho |
|------|-------|----------|
| [SUMMARY_SOCKET_FEATURES.md](./SUMMARY_SOCKET_FEATURES.md) | ⭐ **NEW** - Tổng hợp tất cả tính năng | All devs |
| [CREATE_ROOM_FEATURE.md](./CREATE_ROOM_FEATURE.md) | ⭐ **NEW** - Tạo và quản lý room admin | Desktop devs |
| [SOCKET_MANAGEMENT_ANALYSIS.md](./SOCKET_MANAGEMENT_ANALYSIS.md) | Detailed analysis | Desktop/Backend |
| [SOCKET_CONTROL_BUTTONS.md](./SOCKET_CONTROL_BUTTONS.md) | Control buttons docs | Desktop devs |

### **🧪 Testing**

| File | Mô tả | Dành cho |
|------|-------|----------|
| [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) | ⭐ **NEW** - Checklist test tất cả tính năng | QA/Testers |

### **📊 Diagrams**

Tất cả tài liệu đều có Mermaid diagrams:
- ✅ Sequence diagrams
- ✅ State machines
- ✅ Flow charts
- ✅ UI layouts

---

## 🔌 Socket Events Overview

### **Mobile → Server**

| Event | Payload | Description |
|-------|---------|-------------|
| `REGISTER` | `{room_id, referrer, device_id}` | Register to room |
| `REQ_MSG` | `{key, score: {blue, red}}` | Send score |

### **Server → Mobile**

| Event | Type | Description |
|-------|------|-------------|
| `RES_MSG` | `INIT` | Initial connection |
| `RES_MSG` | `REGISTER` | Registration response |
| `RES_MSG` | `APPROVE_CONNECT` | Approval/Rejection |
| `RES_MSG` | `DISCONNECT_CLIENT` | Disconnection |

### **Admin → Server**

| Event | Payload | Description |
|-------|---------|-------------|
| `REGISTER_ROOM_ADMIN` | `{room_id, uuid_desktop, permission}` | Create room |
| `ADMIN_FETCH_CONN` | `{}` | Fetch devices |
| `APPROVED` | `{socket_id, room_id}` | Approve device |
| `REJECTED` | `{socket_id, room_id}` | Reject device |
| `DISCONNECT_CLIENT` | `{socket_id, room_id}` | Disconnect device |

### **Server → Admin**

| Event | Payload | Description |
|-------|---------|-------------|
| `RES_ROOM_ADMIN` | `{status, data, path}` | Room updates |
| `RES_MSG` | `{status, message}` | Messages |

---

## 🎯 Common Use Cases

### **Use Case 1: Mobile Judge App**

```
1. Read: MOBILE_QUICK_START.md
2. Implement: Connection + Registration
3. Test: With admin panel
4. Read: MOBILE_CLIENT_PROTOCOL.md for details
```

### **Use Case 2: Admin Panel**

```
1. Read: SOCKET_QUICK_REFERENCE.md
2. Study: app/views/Management/Connect/index.jsx
3. Read: SOCKET_CONTROL_BUTTONS.md
4. Implement: Device management
```

### **Use Case 3: Scoreboard Display**

```
1. Read: SOCKET_QUICK_REFERENCE.md
2. Listen: RES_ROOM_ADMIN events
3. Display: Real-time scores
```

### **Use Case 4: Backend Extension**

```
1. Read: SOCKET_MANAGEMENT_ANALYSIS.md
2. Study: server/config/socket.js
3. Understand: Consensus algorithm
4. Extend: Add new features
```

---

## 🔗 Related Files

### **Frontend**

- `app/views/Management/Connect/index.jsx` - Main admin component
- `app/config/hooks/useSocketEvents.js` - Socket hooks
- `app/config/socket/SocketClient.js` - Socket client singleton
- `app/config/redux/reducers/socket-reducer.js` - Redux integration

### **Backend**

- `server/config/socket.js` - Socket.IO server
- `server/constants.js` - Event constants
- `server/index.js` - Server entry point

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Socket.IO Server                        │
│                   (localhost:6789)                          │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Mobile App 1 │    │ Mobile App 2 │    │ Admin Panel  │
│  (Judge 1)   │    │  (Judge 2)   │    │  (Desktop)   │
│              │    │              │    │              │
│ - Scan QR    │    │ - Scan QR    │    │ - Approve    │
│ - Register   │    │ - Register   │    │ - Reject     │
│ - Send Score │    │ - Send Score │    │ - Disconnect │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🎓 Learning Path

### **Beginner**

1. ✅ Read MOBILE_QUICK_START.md
2. ✅ Read SOCKET_QUICK_REFERENCE.md
3. ✅ Try example code
4. ✅ Test with server

### **Intermediate**

1. ✅ Read MOBILE_CLIENT_PROTOCOL.md
2. ✅ Read SOCKET_MANAGEMENT_ANALYSIS.md
3. ✅ Study source code
4. ✅ Implement features

### **Advanced**

1. ✅ Read server/config/socket.js
2. ✅ Understand consensus algorithm
3. ✅ Extend protocol
4. ✅ Add new events

---

## 🐛 Troubleshooting

### **Connection Issues**

See: [MOBILE_CLIENT_PROTOCOL.md#error-handling](./MOBILE_CLIENT_PROTOCOL.md#⚠️-error-handling)

### **Approval Issues**

See: [SOCKET_MANAGEMENT_ANALYSIS.md#troubleshooting](./SOCKET_MANAGEMENT_ANALYSIS.md#🐛-troubleshooting)

### **Score Not Updating**

See: [MOBILE_CLIENT_PROTOCOL.md#testing](./MOBILE_CLIENT_PROTOCOL.md#📊-testing)

---

## 📞 Support

- 📧 Email: support@example.com
- 💬 Slack: #scoreboard-dev
- 📖 Wiki: https://wiki.example.com/scoreboard

---

**Last Updated:** 2026-01-03
**Version:** 1.0.0

