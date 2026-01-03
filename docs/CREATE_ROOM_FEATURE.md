# 🏠 Create Room Admin Feature

## 📋 Tổng quan

Tính năng tạo và quản lý Room Admin, thay thế việc hardcode `room_id` và `uuid_desktop`.

---

## ✨ Tính năng

### **1. Tạo Room Mới**

- ✅ Generate random Room ID (10 ký tự)
- ✅ Generate random UUID Desktop (12 ký tự)
- ✅ Tùy chỉnh Server URL
- ✅ Generate QR Code tự động
- ✅ Download QR Code
- ✅ Copy Room ID / UUID Desktop

### **2. Quản lý Room**

- ✅ Lưu room vào localStorage
- ✅ Auto-connect khi reload page
- ✅ Edit room hiện tại
- ✅ Delete room
- ✅ Hiển thị thông tin room

### **3. QR Code**

- ✅ Generate QR code cho admin
- ✅ Format: `{room_id, server_url, type: "admin"}`
- ✅ Download QR code as PNG
- ✅ Real-time preview

---

## 🎯 User Flow

```
Admin mở trang lần đầu
  ↓
Modal "Tạo Room Admin" xuất hiện
  ↓
Admin click "Generate New Room ID & UUID"
  ↓
Room ID: "1AZJM9JL8D" (random)
UUID Desktop: "CO2GJ74NMD6M" (random)
  ↓
QR Code được generate tự động
  ↓
Admin click "Tạo Room & Kết nối"
  ↓
Room được lưu vào localStorage
Socket connect với room mới
  ↓
Hiển thị Room Info Bar
```

---

## 🖥️ UI Components

### **Room Info Bar**

```
┌─────────────────────────────────────────────────────────────────────┐
│ Room ID: 1AZJM9JL8D  │  UUID Desktop: CO2GJ74NMD6M  │  Server: ...  │
│                                          [📝 Edit Room] [🗑️ Delete] │
└─────────────────────────────────────────────────────────────────────┘
```

**Hiển thị:**
- Room ID (font-mono, bold, blue)
- UUID Desktop (font-mono, bold, blue)
- Server URL (font-mono, gray)
- Edit button
- Delete button

---

### **Create Room Modal**

```
┌─────────────────────────────────────────────────────────────┐
│  Tạo Room Admin Mới                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Room ID *                                                  │
│  [1AZJM9JL8D                              ] [📋 Copy]      │
│  Mã phòng duy nhất (10 ký tự)                              │
│                                                             │
│  UUID Desktop *                                             │
│  [CO2GJ74NMD6M                            ] [📋 Copy]      │
│  Mã định danh thiết bị admin (12 ký tự)                    │
│                                                             │
│  Server URL *                                               │
│  [http://localhost:6789                                  ]  │
│  URL của Socket.IO server                                  │
│                                                             │
│  [🔄 Generate New Room ID & UUID]                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  QR Code cho Admin                                    │ │
│  │                                                       │ │
│  │              ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                   │ │
│  │              █ ▄▄▄▄▄ █▀ ▀▄█ ▄▄▄▄▄ █                   │ │
│  │              █ █   █ █▀▄ ██ █   █ █                   │ │
│  │              █ █▄▄▄█ █ ▀▄██ █▄▄▄█ █                   │ │
│  │              ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀                   │ │
│  │                                                       │ │
│  │  [💾 Download QR Code]                                │ │
│  │  Scan QR code này để kết nối admin panel             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [✅ Tạo Room & Kết nối]  [❌ Hủy]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Structure

### **Room Data (localStorage)**

```javascript
{
  room_id: "1AZJM9JL8D",
  uuid_desktop: "CO2GJ74NMD6M",
  server_url: "http://localhost:6789",
  permission: 9,
  created_at: "2026-01-03T10:30:00.000Z"
}
```

### **QR Code Data**

```javascript
{
  room_id: "1AZJM9JL8D",
  server_url: "http://localhost:6789",
  type: "admin"
}
```

---

## 🔧 Implementation

### **1. Generate Random ID**

```javascript
const generateRandomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Example: "1AZJM9JL8D"
```

### **2. Generate QR Code**

```javascript
import QRCode from "qrcode";

const generateQRCode = async (roomId, serverUrl) => {
  const qrData = {
    room_id: roomId,
    server_url: serverUrl,
    type: "admin"
  };

  const url = await QRCode.toDataURL(JSON.stringify(qrData), {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });

  return url; // data:image/png;base64,...
};
```

### **3. Save to localStorage**

```javascript
const handleCreateRoom = (roomData) => {
  // Save to localStorage
  localStorage.setItem("admin_room", JSON.stringify(roomData));
  
  // Connect to room
  emitSocketEvent("REGISTER_ROOM_ADMIN", {
    room_id: roomData.room_id,
    uuid_desktop: roomData.uuid_desktop,
    permission: 9,
  });
};
```

### **4. Load from localStorage**

```javascript
useEffect(() => {
  const savedRoom = localStorage.getItem("admin_room");
  if (savedRoom) {
    const roomData = JSON.parse(savedRoom);
    setCurrentRoom(roomData);
    
    // Auto connect
    emitSocketEvent("REGISTER_ROOM_ADMIN", {
      room_id: roomData.room_id,
      uuid_desktop: roomData.uuid_desktop,
      permission: 9,
    });
  } else {
    // Show create room modal
    setShowCreateRoom(true);
  }
}, []);
```

---

## 🎨 Component Structure

```
ManagementConnectionSocket
├── State
│   ├── currentRoom (Room data)
│   ├── showCreateRoom (Modal visibility)
│   └── ...
├── Handlers
│   ├── handleCreateRoom()
│   ├── handleOpenCreateRoom()
│   ├── handleDeleteRoom()
│   └── ...
├── UI
│   ├── Room Info Bar
│   ├── Control Buttons
│   ├── Device Table
│   └── Modals
│       ├── Action Modals
│       └── Create Room Modal
│           └── CreateRoomForm
│               ├── Room ID Input
│               ├── UUID Desktop Input
│               ├── Server URL Input
│               ├── Generate Button
│               ├── QR Code Display
│               └── Action Buttons
```

---

## 📝 Files Changed

### **New Files**

- ✅ `app/views/Management/Connect/Forms/CreateRoomForm.jsx` - Create room form component

### **Modified Files**

- ✅ `app/views/Management/Connect/index.jsx` - Main component
  - Added `showCreateRoom` state
  - Added `currentRoom` state
  - Added `handleCreateRoom()` handler
  - Added `handleOpenCreateRoom()` handler
  - Added `handleDeleteRoom()` handler
  - Added Room Info Bar UI
  - Added Create Room Modal
  - Updated `handleRecreateConnection()` to use `currentRoom`

---

## 🚀 Usage

### **First Time Setup**

1. Open Management Connection page
2. Modal "Tạo Room Admin Mới" appears
3. Click "🔄 Generate New Room ID & UUID"
4. Review generated Room ID and UUID
5. (Optional) Edit Server URL
6. Click "✅ Tạo Room & Kết nối"
7. Room is saved and socket connects

### **Edit Existing Room**

1. Click "📝 Edit Room" button
2. Modal opens with current room data
3. Edit Room ID / UUID / Server URL
4. Click "🔄 Generate New Room ID & UUID" for new values
5. Click "✅ Sử dụng Room này"
6. Room is updated and socket reconnects

### **Delete Room**

1. Click "🗑️ Delete" button
2. Confirm deletion
3. Room is removed from localStorage
4. Socket disconnects
5. Create Room modal appears

---

## 📚 Related Documentation

- [SOCKET_QUICK_REFERENCE.md](./SOCKET_QUICK_REFERENCE.md)
- [SOCKET_CONTROL_BUTTONS.md](./SOCKET_CONTROL_BUTTONS.md)
- [MOBILE_CLIENT_PROTOCOL.md](./MOBILE_CLIENT_PROTOCOL.md)

