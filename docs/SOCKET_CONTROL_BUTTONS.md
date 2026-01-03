# 🎛️ Socket Control Buttons Documentation

## 📋 Tổng quan

Tài liệu hướng dẫn sử dụng 2 buttons điều khiển socket trong ManagementConnectionSocket component:

1. **🔴 Turn Off All** - Ngắt tất cả kết nối thiết bị
2. **🔄 Re-create Socket** - Tạo lại kết nối socket

---

## 🔴 Turn Off All Button

### **Mô tả**

Button này cho phép admin ngắt kết nối **tất cả thiết bị** đang kết nối trong room.

### **UI**

```jsx
<Button 
  variant="danger" 
  className="min-w-32"
  onClick={handleTurnOffAll}
  disabled={loading || data.length === 0}
>
  🔴 Turn Off All ({data.length})
</Button>
```

**Tính năng:**
- ✅ Hiển thị số lượng thiết bị đang kết nối
- ✅ Disabled khi không có thiết bị hoặc đang loading
- ✅ Màu đỏ (danger) để cảnh báo
- ✅ Confirm dialog trước khi thực hiện

---

### **Flow hoạt động**

```
User clicks "Turn Off All"
  ↓
Confirm dialog: "Bạn có chắc chắn muốn ngắt kết nối tất cả X thiết bị?"
  ↓
User confirms
  ↓
setLoading(true)
  ↓
Loop through all devices:
  For each device:
    emitSocketEvent("DISCONNECT_CLIENT", {
      socket_id: device.socket_id,
      room_id: device.room_id
    })
  ↓
Wait 1 second
  ↓
handleRefresh() - Refresh device list
  ↓
Console log: "✅ Đã ngắt kết nối X thiết bị"
```

---

### **Implementation**

```javascript
const handleTurnOffAll = () => {
  if (data.length === 0) {
    alert("Không có thiết bị nào để ngắt kết nối");
    return;
  }

  const confirmDisconnect = window.confirm(
    `Bạn có chắc chắn muốn ngắt kết nối tất cả ${data.length} thiết bị?`
  );

  if (confirmDisconnect) {
    setLoading(true);
    
    // Ngắt kết nối từng thiết bị
    data.forEach((device) => {
      if (device.socket_id && device.room_id) {
        emitSocketEvent("DISCONNECT_CLIENT", {
          socket_id: device.socket_id,
          room_id: device.room_id,
        });
      }
    });

    // Refresh lại danh sách sau 1 giây
    setTimeout(() => {
      handleRefresh();
    }, 1000);

    console.log(`✅ Đã ngắt kết nối ${data.length} thiết bị`);
  }
};
```

---

### **Use Cases**

1. **Kết thúc phiên thi đấu** - Ngắt tất cả thiết bị giám định
2. **Reset hệ thống** - Xoá tất cả kết nối cũ
3. **Emergency** - Ngắt nhanh tất cả kết nối khi có sự cố

---

## 🔄 Re-create Socket Button

### **Mô tả**

Button này cho phép admin **tạo lại kết nối socket** từ đầu mà không cần reload trang.

### **UI**

```jsx
<Button 
  variant="warning" 
  className="min-w-32"
  onClick={handleRecreateConnection}
  disabled={isReconnecting || loading}
>
  {isReconnecting ? "🔄 Đang tạo lại..." : "🔄 Re-create Socket"}
</Button>
```

**Tính năng:**
- ✅ Hiển thị trạng thái "Đang tạo lại..." khi đang reconnect
- ✅ Disabled khi đang reconnect hoặc loading
- ✅ Màu vàng (warning) để cảnh báo
- ✅ Confirm dialog trước khi thực hiện

---

### **Flow hoạt động**

```
User clicks "Re-create Socket"
  ↓
Confirm dialog: "Bạn có chắc chắn muốn tạo lại kết nối socket?"
  ↓
User confirms
  ↓
setIsReconnecting(true)
setLoading(true)
  ↓
Step 1: Ngắt kết nối hiện tại
  dispatch(disconnectSocket())
  Wait 500ms
  ↓
Step 2: Tạo kết nối mới
  dispatch(connectSocket('admin'))
  Wait 500ms
  ↓
Step 3: Đăng ký admin vào room
  emitSocketEvent("REGISTER_ROOM_ADMIN", {
    room_id: "1AZJM9JL8D",
    uuid_desktop: "CO2GJ74NMD6M",
    permission: 9
  })
  Wait 500ms
  ↓
Step 4: Refresh danh sách thiết bị
  emitSocketEvent("ADMIN_FETCH_CONN", {})
  ↓
Success alert: "Tạo lại kết nối socket thành công!"
  ↓
setIsReconnecting(false)
setLoading(false)
```

---

### **Implementation**

```javascript
const handleRecreateConnection = async () => {
  const confirmReconnect = window.confirm(
    "Bạn có chắc chắn muốn tạo lại kết nối socket?\n\nSocket hiện tại sẽ bị ngắt và tạo lại kết nối mới."
  );

  if (confirmReconnect) {
    setIsReconnecting(true);
    setLoading(true);

    try {
      console.log("🔄 Bắt đầu tạo lại kết nối socket...");

      // Bước 1: Ngắt kết nối hiện tại
      console.log("1️⃣ Ngắt kết nối socket hiện tại...");
      await dispatch(disconnectSocket());
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Bước 2: Tạo kết nối mới
      console.log("2️⃣ Tạo kết nối socket mới...");
      await dispatch(connectSocket('admin'));
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Bước 3: Đăng ký lại admin vào room
      console.log("3️⃣ Đăng ký admin vào room...");
      emitSocketEvent("REGISTER_ROOM_ADMIN", {
        room_id: "1AZJM9JL8D",
        uuid_desktop: "CO2GJ74NMD6M",
        permission: 9,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Bước 4: Refresh danh sách
      console.log("4️⃣ Refresh danh sách thiết bị...");
      emitSocketEvent("ADMIN_FETCH_CONN", {});

      console.log("✅ Tạo lại kết nối socket thành công!");
      alert("Tạo lại kết nối socket thành công!");

    } catch (error) {
      console.error("❌ Lỗi khi tạo lại kết nối:", error);
      alert("Lỗi khi tạo lại kết nối socket. Vui lòng thử lại.");
    } finally {
      setIsReconnecting(false);
      setLoading(false);
    }
  }
};
```

---

### **Use Cases**

1. **Connection issues** - Khi socket bị lỗi hoặc mất kết nối
2. **Server restart** - Sau khi server restart cần reconnect
3. **Network issues** - Khi có vấn đề về network
4. **Testing** - Test lại kết nối socket

---

## 📊 Console Logs

### **Turn Off All**

```
✅ Đã ngắt kết nối 5 thiết bị
📤 Emit event: DISCONNECT_CLIENT { socket_id: 'abc123', room_id: '1AZJM9JL8D' }
📤 Emit event: DISCONNECT_CLIENT { socket_id: 'def456', room_id: '1AZJM9JL8D' }
...
📤 Emit event: ADMIN_FETCH_CONN {}
```

### **Re-create Socket**

```
🔄 Bắt đầu tạo lại kết nối socket...
1️⃣ Ngắt kết nối socket hiện tại...
🔌 Socket disconnected
❌ Socket disconnected. Reason: client namespace disconnect
2️⃣ Tạo kết nối socket mới...
Connecting socket with role: admin
✅ Socket connected with role: admin, ID: xyz789
3️⃣ Đăng ký admin vào room...
📤 Emit event: REGISTER_ROOM_ADMIN { room_id: '1AZJM9JL8D', uuid_desktop: 'CO2GJ74NMD6M', permission: 9 }
4️⃣ Refresh danh sách thiết bị...
📤 Emit event: ADMIN_FETCH_CONN {}
✅ Tạo lại kết nối socket thành công!
```

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [🔴 Turn Off All (5)]  [🔄 Re-create Socket]  ✅ Socket Connected      │
│                                                                         │
│                                    [Cập nhật license]                   │
│                                    [Mã kích hoạt điện thoại]            │
│                                    [Tải lại]                            │
└─────────────────────────────────────────────────────────────────────────┘
```

**Left side:**
- 🔴 Turn Off All button (danger)
- 🔄 Re-create Socket button (warning)
- Socket connection status indicator

**Right side:**
- Cập nhật license button
- Mã kích hoạt điện thoại button
- Tải lại button

---

## ⚠️ Lưu ý quan trọng

### **Turn Off All**

1. ✅ **Confirm trước khi thực hiện** - Tránh ngắt nhầm
2. ✅ **Disabled khi không có thiết bị** - Tránh lỗi
3. ✅ **Refresh sau khi ngắt** - Cập nhật UI
4. ✅ **Timeout 1s** - Đợi server xử lý xong

### **Re-create Socket**

1. ✅ **Async/await** - Đảm bảo thứ tự thực hiện
2. ✅ **Timeout giữa các bước** - Đợi socket connect/disconnect
3. ✅ **Try/catch** - Handle errors
4. ✅ **Finally block** - Reset loading states
5. ✅ **Redux actions** - Sử dụng Redux để quản lý socket

---

## 🐛 Troubleshooting

### **Turn Off All không hoạt động**

```javascript
// Check data
console.log("Devices:", data);

// Check socket_id và room_id
data.forEach((device) => {
  console.log("Device:", device.socket_id, device.room_id);
});
```

### **Re-create Socket bị lỗi**

```javascript
// Check Redux state
const socket = useSelector((state) => state.socket);
console.log("Socket state:", socket);

// Check socket instance
import { socketClient } from '../../../config/routes';
console.log("Socket connected:", socketClient.isConnected());
console.log("Socket ID:", socketClient.getSocketId());
```

### **Socket không reconnect**

1. Check server đang chạy: `http://localhost:6789`
2. Check Redux actions: `connectSocket`, `disconnectSocket`
3. Check console logs
4. Check Network tab → WebSocket

---

## 📚 References

- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Hooks](https://react.dev/reference/react)

