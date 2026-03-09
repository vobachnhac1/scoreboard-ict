# Thiết kế Phân quyền Gói cước (Package Tiers Design)

Tài liệu này mô tả thiết kế phân tử cho các gói cước và phân quyền tính năng trong phần mềm DIGISPORTS.

## 1. Phân loại Gói cước (Package Tiers)

Hệ thống cung cấp 3 gói cước chính phù hợp với quy mô giải đấu khác nhau:

### 1.1 Gói Cơ bản (BASIC)
Dành cho các giải đấu quy mô nhỏ, câu lạc bộ, quản lý gọn nhẹ.
**Tính năng bao gồm:**
- Bảng điểm Đối kháng.
- Bảng điểm Quyền.
- Quản lý Giải đấu (Cấu hình hạng cân, vận động viên).
- Cấu hình Hệ thống, Quản lý kết nối Trọng tài căn bản.
- Kết xuất báo cáo (biên bản thi đấu cơ bản).

### 1.2 Gói Nâng cao (ADVANCED) (Mặc định)
Dành cho giải đấu cấp quận/huyện, nâng cấp phương thức chấm & hiển thị hình ảnh chuẩn.
**Tính năng bổ sung (Bao gồm Gói Cơ bản +):**
- Bảng điểm Võ nhạc (Do đặc thù chấm điểm nhạc phức tạp cần panel điều khiển riêng).
- Màn hình phụ trợ (Secondary Display / Kết nối màn hình LED lớn ngoài sân đấu).
- Export biên bản và bảng tổng sắp chi tiết phân loại nâng cao.

### 1.3 Gói Doanh nghiệp (ENTERPRISE)
Dành cho hệ thống các giải đấu quy mô lớn (Quốc gia/Quốc tế), cần độ an toàn cực cao.
**Tính năng tối đa (Bao gồm Gói Nâng cao +):**
- Đồng bộ dữ liệu mạng LAN (LAN Sync): Đồng bộ CSDL trực tiếp giữa nhiều máy chủ/hub.
- Tự động Backup An toàn Dữ liệu (Auto Database Backup).

---

## 2. Logic Phân quyền Hệ thống

Hệ thống dựa vào thông tin `packageName` được cấp từ khóa kích hoạt (License Key) ở Redux store (`state.license`) để tự động nội suy nhóm gói cước phù hợp.

### 2.1 Cấu trúc mã hóa (src/components/FeatureLock/index.jsx)
Cung cấp hai constant quan trọng:
- `PACKAGE_TIERS`: Định nghĩa trọng số gói cước (`BASIC: 1`, `ADVANCED: 2`, `ENTERPRISE: 3`).
- `getPackageTier(packageName)`: Hàm parser sẽ kiểm tra tên gói để trả về đúng trọng số (từ khóa như 'cơ bản', 'pro', 'doanh nghiệp').

Một custom hook được cung cấp để các Component có thể chủ động render giao diện theo gói cước:
```javascript
const { hasAccess } = usePackageAccess();
if (hasAccess(PACKAGE_TIERS.ENTERPRISE)) {
   // Show enterprise component
}
```

### 2.2 Các Cơ Chế Chặn (Lock Mechanisms)

Hệ thống ngăn chặn/cảnh báo truy cập sai gói cước trên nhiều bề mặt:

1. **Routing Layer (`app/config/routes.js`)**:
   Mỗi đối tượng route có thêm thược tính `requiredTier`. Khi truy cập, component `<FeatureLock requiredTier={...}>` sẽ chặn đứng ở vòng ngoài. Nếu người dùng không đủ cấp (VD: Tài khoản Basic cố vào route Võ Nhạc cần Advanced), Component sẽ `redirect` về trang chủ (Dashboard).
   
2. **Side Menu Overlay (`app/components/Layout/AdminLayout.jsx`)**:
   Sidebar ẩn hẳn các menu không đủ đặc quyền. VD: Menu mục `Data Sync` sẽ tự động bị _ẩn hoàn toàn_ ngay tại thanh menu chính nếu `packageName` không phải Enterprise. Mắt thường không nhìn thấy.

3. **Dashboard Overlay (`app/views/Dashboard/index.jsx`)**:
   Các nhóm card tính năng sẽ tự động chuyển sang chế độ _"Bị khoá"_ (`grayscale-[50%]`, dán mác `Gói Doanh Nghiệp` trên góc phải thẻ) - Khóa trực quan báo hiệu nhưng vẫn thông tin tới người dùng nhằm upscale nâng gói cước (Marketing approach).
