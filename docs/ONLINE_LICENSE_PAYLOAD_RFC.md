# ONLINE LICENSE SERVER PAYLOAD ĐỀ XUẤT (COMPREHENSIVE)

Tài liệu này định nghĩa cấu trúc JSON chuẩn mà **Online License Server** (`https://digisports.com.vn/api/v1/device-activations/activate`) cần trả về cho phần mềm Scoreboard ICT.

Mục tiêu của gói tin này là:
1. Đồng bộ gói cước `packageName` (BASIC/ADVANCED/ENTERPRISE).
2. Xây dựng tham số `features` để hệ thống quản lý trực tuyến có thể ghi đè (override) hoặc thu hồi quyền truy cập của bất kỳ tính năng (feature/module routes) và tùy chọn cấu hình nhỏ nhất (config fields) nào từ xa mà không cần cập nhật ứng dụng cục bộ.

## 1. Cấu trúc Response JSON chuẩn nên trả về (Gói tin chuẩn)

```json
{
  "isActive": true,
  "activatedAt": "2026-03-09T00:00:00.000Z",
  "expiredDate": "2027-03-10T00:00:00.000Z",
  "licenseKeyId": "LK-FULL-ACCESS-9999",
  "packageName": "ENTERPRISE",
  "maxDevices": 50,
  "deviceInfo": {
    "uuid_desktop": "app-generated-uuid",
    "mac_address": "00:1A:2B:3C:4D:5E",
    "app_version": "1.0.0",
    "platform": "darwin"
  },
  "features": {
    "module_overrides": {
      "/bang-diem/doi-khang": true,
      "/bang-diem/quyen": true,
      "/bang-diem/vo-nhac": true,
      "/secondary-display": true,
      "/management/general-setting/competition-management": true,
      "/management/general-setting/config-system": true,
      "/management/connect": true,
      "/management/data-sync": true
    },
    "disabled_configs": [],
    "custom_event_name": "GIẢI ONLINE TOÀN QUYỀN",
    "forced_keyboard_mode": "pencak",
    "allowed_keyboard_modes": [
      "vovinam",
      "pencak",
      "vohiendai",
      "default"
    ],
    "custom_keymaps": {
      "pencak": {
        "RED_SCORE_PLUS_2": "bracketright",
        "BLUE_SCORE_PLUS_2": "bracketleft",
        "TOGGLE_TIMER": "Enter",
        "UNDO": "Delete"
      },
      "vovinam": {
        "RED_SCORE_PLUS_1": "1",
        "BLUE_SCORE_PLUS_1": "2"
      }
    }
  }
}
```

## 2. Giải Nghĩa Khóa `features` & Tất Cả Biến Được Hỗ Trợ 

### A. `module_overrides` (Object)
Khoá / Mở khóa cấp màn hình (Routes). Giá trị truyền vào là `true` (ép MỞ bất kể bị giới hạn gói cước) hoặc `false` (ép KHÓA cho dù gói cước cao cấp tới đâu).
> *Lưu ý: Nếu không gửi key lên, app sẽ chạy theo luật Mặc Định của gói cước hiện tại.*

**Danh sách tất cả các KEY hỗ trợ cho `module_overrides`**:
- Màn hình Bảng điểm:
  - `"/bang-diem/doi-khang"`
  - `"/bang-diem/quyen"`
  - `"/bang-diem/vo-nhac"` 
  - `"/secondary-display"` (Màn hình phụ)
- Màn hình Cài đặt & Quản lý:
  - `"/management/connect"` (Quản lý kết nối màn hình phụ)
  - `"/management/general-setting/competition-management"` (Quản lý giải đấu)
  - `"/management/general-setting/config-system"` (Hệ thống cấu hình)
  - `"/management/data-sync"` (Cấu hình LAN/Cloud Sync)

### B. `disabled_configs` (Array of Strings)
Khóa cứng bất kỳ nút cấu hình, tùy chọn select box, vùng nhập text hay nút gạt (Switch) nào trong danh sách dưới đây. Cấu hình nằm trong mảng này sẽ bị vô hiệu hóa (disabled / ẩn mờ) trên giao diện.

**Danh sách TẤT CẢ CÁC KEY cấu hình hệ thống hỗ trợ khóa:**

**1. Các Thông Tin Chung (Inputs & Textareas)**
- `bo_mon` (Bộ môn)
- `ten_giai_dau` (Tên giải đấu)
- `mo_ta_giai_dau` (Mô tả)
- `thoi_gian_bat_dau`, `thoi_gian_ket_thuc` (Ngày bắt đầu/kết thúc)
- Tùy chỉnh giây: `thoi_gian_tinh_diem`, `thoi_gian_thi_dau`, `thoi_gian_nghi`, `thoi_gian_hiep_phu`, `thoi_gian_y_te`
- `khoang_diem_tuyet_toi` (Dấu mốc khoảng điểm cách biệt)
- Chỉnh điểm mặc định nút: `diem_don_chan`, `diem_nga`, `diem_bien_tru`, `diem_bien_cong`

**2. Các Select Boxes**
- `keyboard_mode` (Chế độ phím)
- `he_diem` (Hệ điểm)
- `so_giam_dinh` (Số giám định)
- `so_hiep` (Số hiệp)
- `so_hiep_phu` (Số hiệp phụ)

**3. Các Tính Năng Chế Độ (Switches)**
- `cau_hinh_doi_khang_diem_thap`, `cau_hinh_quyen_tinh_tong`
- `cau_hinh_y_te`, `cau_hinh_tinh_diem_tuyet_doi`
- `cau_hinh_xoa_nhac_nho`, `cau_hinh_xoa_canh_cao`, `cau_hinh_hinh_thuc_quyen`

**4. Chế Độ Bảng Điểm Tắt Bật**
- `ap_dung_doikhang`, `ap_dung_quyen`, `ap_dung_vonhac`
- `bat_am_thanh`, `ap_dung_diem_bien_tru`, `ap_dung_diem_bien_cong`

**5. Điều Khiển Giao Diện Bàn Phím Đấu (Hiển thị Nút / Nút Lệnh)**
- Điểm: `hien_thi_button_diem_1`, `hien_thi_button_diem_2`, `hien_thi_button_diem_3`, `hien_thi_button_diem_5`, `hien_thi_button_diem_10`
- Kỹ thuật / Vi phạm: `hien_thi_button_nhac_nho`, `hien_thi_button_canh_cao`, `hien_thi_button_don_chan`, `hien_thi_button_bien`, `hien_thi_button_nga`, `hien_thi_button_y_te`, `hien_thi_button_thang`
- Lệnh: `hien_thi_button_quay_lai`, `hien_thi_button_reset`, `hien_thi_button_lich_su`, `hien_thi_button_cau_hinh`, `hien_thi_button_ket_thuc`, `hien_thi_button_tran_tiep_theo`, `hien_thi_button_tran_truoc`, `hien_thi_button_hiep_phu`

**6. Cấu hình Bảng Thông Tin Trận Đấu**
- `hien_thi_thong_tin_nhac_nho`, `hien_thi_thong_tin_canh_cao`, `hien_thi_thong_tin_don_chan`, `hien_thi_thong_tin_y_te`

### C. `custom_event_name` (String - Không Bắt Buộc)
Nếu được khai báo, máy con sẽ tự động được gán cứng và hiển thị tên "Giải Đấu Toàn Quốc" ở tiêu đề, bất chấp mọi thay đổi cục bộ hiện trường. 

### D. `forced_keyboard_mode` (String - Không Bắt Buộc)
Ép buộc ứng dụng Desktop phải sử dụng một chế độ cấu hình của một môn thi đấu cụ thể. Các giá trị hợp lệ tương ứng với Object `KEYBOARD_MODES`.
- `"vovinam"` (Vovinam)
- `"pencak"` (Pencak Silat)
- `"vohiendai"` (Võ thuật hiện đại)
Khi tham số này được gửi xuống, màn hình Cài Đặt của Client sẽ tự động chuyển sang Option bộ môn tương ứng và SelectBox "Chế độ phím" sẽ bị vô hiệu hóa (disabled), không cho phép trọng tài đổi tùy tiện ở máy con.

### E. `allowed_keyboard_modes` (Array of Strings - Không Bắt Buộc)
Giới hạn danh sách các bộ môn (Chế độ phím) được phép hiển thị trong SelectBox. Khi tham số này được phân phối, người dùng tại máy trạm chỉ có thể chọn các bộ môn nằm trong danh sách này.
Ví dụ: `["vovinam", "pencak"]` sẽ ẩn môn `vohiendai` (Võ cổ truyền) khỏi menu cấu hình thay đổi bộ môn.
Các giá trị hợp lệ nằm trong `KEYBOARD_MODES`.

### F. `custom_keymaps` (Object - Không Bắt Buộc)
Cho phép map và ghi đè lại các phím tắt bàn phím của một bộ môn cụ thể trực tiếp từ Server thay vì dùng code mặc định của Frontend. Tầng Object thứ nhất là `mã_bộ_môn` (vd: `pencak`, `vovinam`, `default`), tầng thứ 2 là `hành_động: phím_bấm`.
Ví dụ nếu môn Pencak Silat bị xung đột phím điểm "+2" ở Đỏ với màn hình máy Laptop:
```json
"custom_keymaps": {
  "pencak": {
    "RED_SCORE_PLUS_2": "bracketright",
    "BLUE_SCORE_PLUS_2": "bracketleft"
  }
}
```
Hệ thống con `BangDiemDoiKhang` sẽ tự động mix phím tắt Online này với Layout Offline để nhận phím mơí. Không cần Deploy lại mã nguồn App.

---

Với việc tổ chức dữ liệu dạng JSON thuần và ánh xạ chính xác 1-1 với State trong Redux Desktop App này, **Server Quản Trị Trực Tuyến** đã hoàn toàn có sức mạnh tối thượng điều phối mọi góc cạnh phần mềm, phục vụ cho bất kì gói kinh doanh B2B/B2C tương lai nào linh hoạt nhất.
