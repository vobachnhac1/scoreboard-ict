# ✅ Socket Features Testing Checklist

## 🎯 Mục đích

Checklist để test tất cả tính năng Socket.IO đã implement.

---

## 🏠 Create Room Admin

### **First Time Setup**

- [ ] Mở trang lần đầu → Modal "Tạo Room Admin" xuất hiện
- [ ] Room ID được generate tự động (10 ký tự)
- [ ] UUID Desktop được generate tự động (12 ký tự)
- [ ] Server URL mặc định là `http://localhost:6789`
- [ ] QR Code được hiển thị
- [ ] Click "📋 Copy" bên Room ID → Copy thành công
- [ ] Click "📋 Copy" bên UUID → Copy thành công
- [ ] Click "💾 Download QR Code" → Download file PNG
- [ ] Click "🔄 Generate New" → Room ID và UUID thay đổi
- [ ] Click "✅ Tạo Room & Kết nối" → Modal đóng
- [ ] Room Info Bar xuất hiện
- [ ] Socket connected (✅ Socket Connected)
- [ ] localStorage có key "admin_room"

### **Reload Page**

- [ ] Reload page → Không hiển thị modal
- [ ] Room Info Bar hiển thị đúng thông tin
- [ ] Socket auto-connect
- [ ] Danh sách thiết bị được load

### **Edit Room**

- [ ] Click "📝 Edit Room" → Modal xuất hiện
- [ ] Modal hiển thị thông tin room hiện tại
- [ ] Edit Room ID → QR Code update
- [ ] Edit UUID Desktop → QR Code update
- [ ] Edit Server URL → QR Code update
- [ ] Click "🔄 Generate New" → IDs thay đổi
- [ ] Click "✅ Sử dụng Room này" → Room được update
- [ ] Socket reconnect với room mới
- [ ] localStorage được update

### **Delete Room**

- [ ] Click "🗑️ Delete" → Confirm dialog xuất hiện
- [ ] Click Cancel → Không xóa
- [ ] Click OK → Room bị xóa
- [ ] Room Info Bar biến mất
- [ ] Socket disconnect
- [ ] localStorage không còn "admin_room"
- [ ] Modal "Tạo Room Admin" xuất hiện

---

## 🔴 Turn Off All Button

### **Basic Functionality**

- [ ] Button hiển thị số lượng thiết bị: "🔴 Turn Off All (X)"
- [ ] Khi không có thiết bị → Button disabled
- [ ] Khi có thiết bị → Button enabled
- [ ] Click button → Confirm dialog xuất hiện
- [ ] Confirm message hiển thị đúng số lượng thiết bị
- [ ] Click Cancel → Không ngắt kết nối
- [ ] Click OK → Tất cả thiết bị bị ngắt

### **After Disconnect**

- [ ] Console log: "✅ Đã ngắt kết nối X thiết bị"
- [ ] Sau 1 giây → Danh sách refresh
- [ ] Danh sách thiết bị trống
- [ ] Button disabled (vì không còn thiết bị)

---

## 🔄 Re-create Socket Button

### **Basic Functionality**

- [ ] Button hiển thị "🔄 Re-create Socket"
- [ ] Khi không có room → Button disabled
- [ ] Khi có room → Button enabled
- [ ] Click button → Confirm dialog xuất hiện
- [ ] Click Cancel → Không reconnect
- [ ] Click OK → Bắt đầu reconnect

### **Reconnection Process**

- [ ] Button text thay đổi: "🔄 Đang tạo lại..."
- [ ] Button disabled trong quá trình reconnect
- [ ] Console log: "🔄 Bắt đầu tạo lại kết nối socket..."
- [ ] Console log: "1️⃣ Ngắt kết nối socket hiện tại..."
- [ ] Socket status: ❌ Socket Disconnected
- [ ] Console log: "2️⃣ Tạo kết nối socket mới..."
- [ ] Socket status: ✅ Socket Connected
- [ ] Console log: "3️⃣ Đăng ký admin vào room..."
- [ ] Console log: "4️⃣ Refresh danh sách thiết bị..."
- [ ] Console log: "✅ Tạo lại kết nối socket thành công!"
- [ ] Alert: "Tạo lại kết nối socket thành công!"
- [ ] Button text trở lại: "🔄 Re-create Socket"
- [ ] Button enabled
- [ ] Danh sách thiết bị được refresh

### **Error Handling**

- [ ] Nếu có lỗi → Console error
- [ ] Alert: "Lỗi khi tạo lại kết nối socket..."
- [ ] Button enabled lại
- [ ] Loading state reset

---

## 📱 Mobile Client Connection

### **QR Code Scan**

- [ ] Mobile scan QR code → Nhận được room_id và server_url
- [ ] Mobile connect đến server
- [ ] Mobile nhận RES_MSG (INIT)
- [ ] Mobile emit REGISTER

### **Registration**

- [ ] Admin panel nhận thông báo thiết bị mới
- [ ] Thiết bị xuất hiện trong danh sách
- [ ] Status: "Chờ duyệt" (pending)
- [ ] Trạng thái: "Đã kết nối và chờ duyệt"

### **Approval**

- [ ] Admin click "KH" (Kích hoạt)
- [ ] Server generate token
- [ ] Mobile nhận RES_MSG (APPROVE_CONNECT) với token
- [ ] Thiết bị status: "Đã duyệt" (approved)
- [ ] Trạng thái: "Đã kết nối và được duyệt"

### **Send Score**

- [ ] Mobile gửi REQ_MSG với token
- [ ] Server validate token
- [ ] Server nhận điểm số
- [ ] Consensus algorithm chạy
- [ ] Điểm được cộng (nếu đủ consensus)

### **Rejection**

- [ ] Admin click "Reject"
- [ ] Mobile nhận RES_MSG (APPROVE_CONNECT) không có token
- [ ] Thiết bị status: "Từ chối" (rejected)

### **Disconnect**

- [ ] Admin click "DIS" (Disconnect)
- [ ] Mobile nhận RES_MSG (DISCONNECT_CLIENT)
- [ ] Mobile bị disconnect sau 1 giây
- [ ] Thiết bị biến mất khỏi danh sách

---

## 🎛️ Device Management

### **Fetch Devices**

- [ ] Click "Tải lại" → Loading state
- [ ] Emit ADMIN_FETCH_CONN
- [ ] Nhận RES_ROOM_ADMIN
- [ ] Danh sách thiết bị update
- [ ] Loading state tắt

### **Device Table**

- [ ] Hiển thị đúng số lượng thiết bị
- [ ] Columns: STT, Tên TB, Quyền GD, Mã TB, IP, TT, Duyệt, Actions
- [ ] Status icon: ✅ (active) / ❌ (inactive)
- [ ] Approval status: ✅ (approved) / ⏳ (pending) / ❌ (rejected)
- [ ] Actions buttons: KH, GD, DIS, MSG

### **Double Click**

- [ ] Double click row → Modal "Cập nhật thông tin" xuất hiện
- [ ] Modal hiển thị thông tin thiết bị
- [ ] Update thông tin → Emit event
- [ ] Danh sách refresh

---

## 🔌 Socket Connection

### **Connection Status**

- [ ] Khi connected: "✅ Socket Connected" (màu xanh)
- [ ] Khi disconnected: "❌ Socket Disconnected" (màu đỏ)
- [ ] Status update real-time

### **Auto Reconnect**

- [ ] Tắt server → Socket disconnect
- [ ] Status: ❌ Socket Disconnected
- [ ] Bật server → Socket auto reconnect
- [ ] Status: ✅ Socket Connected

---

## 💾 localStorage

### **Save Room**

- [ ] Tạo room → localStorage.setItem("admin_room")
- [ ] Data format đúng: `{room_id, uuid_desktop, server_url, permission, created_at}`

### **Load Room**

- [ ] Reload page → localStorage.getItem("admin_room")
- [ ] Parse JSON thành công
- [ ] setCurrentRoom(roomData)
- [ ] Auto connect

### **Update Room**

- [ ] Edit room → localStorage update
- [ ] Data mới được lưu

### **Delete Room**

- [ ] Delete room → localStorage.removeItem("admin_room")
- [ ] Key không còn tồn tại

---

## 🐛 Error Cases

### **No Room**

- [ ] localStorage empty → Modal xuất hiện
- [ ] Không thể close modal (alert)
- [ ] Phải tạo room mới

### **Invalid Room Data**

- [ ] localStorage có data lỗi → Catch error
- [ ] Modal xuất hiện
- [ ] Console error

### **Server Offline**

- [ ] Server offline → Socket disconnect
- [ ] Status: ❌ Socket Disconnected
- [ ] Không crash app

### **Network Error**

- [ ] Mất mạng → Socket disconnect
- [ ] Có mạng lại → Auto reconnect

---

## 📊 Console Logs

### **Create Room**

```
✅ Created/Connected to room: {room_id: "...", ...}
📤 Emit event: REGISTER_ROOM_ADMIN {...}
```

### **Turn Off All**

```
✅ Đã ngắt kết nối 5 thiết bị
📤 Emit event: DISCONNECT_CLIENT {...}
📤 Emit event: ADMIN_FETCH_CONN {}
```

### **Re-create Socket**

```
🔄 Bắt đầu tạo lại kết nối socket...
1️⃣ Ngắt kết nối socket hiện tại...
2️⃣ Tạo kết nối socket mới...
3️⃣ Đăng ký admin vào room...
4️⃣ Refresh danh sách thiết bị...
✅ Tạo lại kết nối socket thành công!
```

---

## ✅ Test Summary

**Total Tests:** ~100+

**Categories:**
- 🏠 Create Room: 25 tests
- 🔴 Turn Off All: 10 tests
- 🔄 Re-create Socket: 15 tests
- 📱 Mobile Client: 20 tests
- 🎛️ Device Management: 15 tests
- 🔌 Socket Connection: 10 tests
- 💾 localStorage: 10 tests
- 🐛 Error Cases: 10 tests

---

**Tester:** _______________  
**Date:** _______________  
**Status:** ⬜ Pass / ⬜ Fail  
**Notes:** _______________

