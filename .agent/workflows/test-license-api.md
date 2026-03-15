---
description: Kiểm tra và xác minh kết quả trả về từ API kích hoạt license online (/api/v1/device-activations/activate)
---

# Workflow: Test License Activation API

Mục đích: Kiểm tra xem Online License Server (`https://digisports.com.vn/api/v1/device-activations/activate`) trả về đúng cấu trúc JSON theo chuẩn RFC (`docs/ONLINE_LICENSE_PAYLOAD_RFC.md`) hay không, bao gồm `features`, `config_presets`, và `custom_keymaps`.

## Bước 1 – Khởi động local server

// turbo
```bash
cd /Users/feliz/Documents/binhtanICT/scoreboard-ict && npm run server
```

Chờ đến khi thấy dòng `Server running on port 6789` hoặc tương tự.

---

## Bước 2 – Gọi API kích hoạt qua localhost (cổng local server)

Thay `YOUR_LICENSE_KEY` bằng key thực tế trước khi chạy:

```bash
curl -s -X POST http://localhost:6789/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{"license_key": "YOUR_LICENSE_KEY"}' | jq .
```

**Kết quả mong đợi (`success: true`):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "packageName": "ENTERPRISE",
    "features": { "module_overrides": {}, "custom_keymaps": {}, ... },
    "config_presets": { "pencak": { "so_hiep": "5", ... } },
    "daysRemaining": 365,
    "status": "active"
  },
  "message": "License activated successfully"
}
```

---

## Bước 3 – Kiểm tra RAW response từ Online Server (bypass local)

Cần `DEVICE_MAC`, `DEVICE_UUID` thực tế. Lấy từ log của Bước 1 hoặc từ `server/config/config.js`.

```bash
curl -s -X POST https://digisports.com.vn/api/v1/device-activations/activate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "YOUR_LICENSE_KEY",
    "deviceType": "COMPUTER",
    "deviceId": "YOUR_MAC_ADDRESS",
    "deviceInfo": {
      "uuid_desktop": "YOUR_UUID",
      "mac_address": "YOUR_MAC_ADDRESS",
      "app_version": "1.0.0",
      "platform": "darwin"
    }
  }' | jq .
```

**Checklist sau khi nhận response từ Online Server:**

- [ ] `isActive` = `true`
- [ ] `packageName` tồn tại và là chuỗi (`BASIC` | `ADVANCED` | `ENTERPRISE`)
- [ ] `features` tồn tại (object)
  - [ ] `features.module_overrides` (object) — nếu có
  - [ ] `features.disabled_configs` (array) — nếu có
  - [ ] `features.forced_keyboard_mode` (string) — nếu có
  - [ ] `features.allowed_keyboard_modes` (array) — nếu có
  - [ ] `features.custom_keymaps` (object) — nếu có
    - [ ] `custom_keymaps.system` (object) — nếu có
- [ ] `config_presets` tồn tại (object, nằm NGANG với `features`)
  - [ ] `config_presets.pencak` (object) — nếu có
  - [ ] `config_presets.vovinam` (object) — nếu có
- [ ] `expiredDate` tồn tại (ISO string)
- [ ] `licenseKeyId` tồn tại

---

## Bước 4 – Xác minh Redux Store sau khi kích hoạt (trong browser DevTools)

Mở App → F12 → Console → dán đoạn sau:

```javascript
// Kiểm tra redux store (nếu dùng Redux DevTools Extension)
window.__REDUX_DEVTOOLS_EXTENSION__ && console.log("Redux DevTools available");

// Hoặc tạm thời thêm vào App.jsx để debug:
// import { useSelector } from 'react-redux';
// const licenseState = useSelector(s => s.license);
// console.log('License State:', JSON.stringify(licenseState, null, 2));
```

**Kiểm tra các field sau trong `state.license`:**
- `valid` = `true`
- `packageName` = đúng gói
- `features` = object từ Server
- `config_presets` = object từ Server (field mới)
- `daysRemaining` > 0

---

## Bước 5 – Xác minh Preset được áp dụng đúng trong ConfigSystem

1. Mở App → Vào **Quản lý → Cài đặt hệ thống**
2. Kiểm tra:
   - Nếu `config_presets.pencak.so_hiep = "5"` → Dropdown "Số hiệp" phải hiển thị `5`
   - Nếu `config_presets.pencak.disabledFields` chứa `"he_diem"` → Dropdown "Hệ điểm" phải bị disable (mờ)
   - Nếu `features.forced_keyboard_mode = "pencak"` → Dropdown "Chế độ phím" phải chọn Pencak và bị disable
3. Mở Console để thấy log: `🌐 Đã áp dụng config_presets online cho mode "pencak": {...}`

---

## Bước 6 – Ghi nhận kết quả

Điền kết quả vào bảng sau và lưu vào `docs/test-results/license-api-YYYY-MM-DD.md`:

| Hạng mục | Kết quả | Ghi chú |
|---|---|---|
| Kết nối Online Server | ✅ / ❌ | |
| `isActive` = true | ✅ / ❌ | |
| `packageName` đúng | ✅ / ❌ | |
| `features` object có | ✅ / ❌ | |
| `config_presets` object có | ✅ / ❌ | |
| Preset áp dụng đúng UI | ✅ / ❌ | |
| Redux store cập nhật | ✅ / ❌ | |
