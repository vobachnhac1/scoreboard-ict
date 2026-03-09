# 🌍 Hướng dẫn Refactor i18n cho các màn hình còn lại

## ✅ ĐÃ HOÀN THÀNH

### 1. **Cơ sở hạ tầng i18n**
- ✅ Tạo `LanguageSwitcher` component (đặt cạnh ThemeToggle trong Sidebar)
- ✅ Thêm 134 translation keys mới vào `vi.json` và `en.json`
- ✅ Tích hợp Redux + i18next

### 2. **Màn hình đã refactor hoàn chỉnh**
- ✅ **Dashboard** (`app/views/Dashboard/index.jsx`) - 15+ translations
- ✅ **NotFound** (`app/views/Error/NotFound.jsx`) - 10+ translations
- ✅ **AboutUs** (`app/views/AboutUs/index.jsx`) - 5+ translations (partial)
- ✅ **LicenseActivation** (`app/views/LicenseActivation/index.jsx`) - 10+ translations
- ✅ **LicenseStatus** (`app/components/LicenseStatus/index.jsx`) - 6+ translations
- ✅ **UserGuide** (`app/views/UserGuide/index.jsx`) - Tab names (partial)
- ✅ **UpdateManager** (`app/views/UpdateManager/index.jsx`) - Import added (partial)

### 3. **Translation Keys đã thêm (134 keys)**
```
general_settings, license_activation, license_management, enter_license_key,
manage_your_license, back_to_dashboard, change_license_key, enter_license_code,
license_key_placeholder, activating, activate, activation_success, activation_failed,
update_manager, current_version, latest_version, check_for_updates, checking_updates,
download_update, downloading, install_update, update_available, no_updates, update_error,
release_date, file_size, changelog, connection_management_title, connected_devices,
device_name, device_type, device_status, connected, disconnected, approve, reject,
disconnect, send_message, activate_device, register_referee, close, message, send,
config_system_title, competition_info, competition_name, competition_location,
competition_date, organizer, referee_count, logo_management, add_logo, upload_logo,
logo_url, background_settings, background_color, background_image, background_opacity,
title_color, save, save_success, save_error, reload, competition_management_title,
create_competition, import_excel, export_excel, competition_list, match_list,
match_number, match_status, waiting, in_progress, finished, enter_match, view_details,
athlete, team, red_team, blue_team, score, result, winner, user_guide_title,
guide_overview, guide_setup, guide_competition, guide_scoring, guide_connection,
guide_intro_title, guide_intro_content, guide_features, guide_import_excel,
guide_manage_matches, guide_update_match, guide_scoring_system, guide_device_connection,
guide_qr_code, guide_referee_app, guide_reports, no_data, loading, error, success,
confirm, yes, no, confirm_delete, delete_success, delete_error, update_success,
update_error, create_success, create_error, required_field, invalid_input, select_file,
file_selected, upload_success, upload_error, download, print, preview, filter, sort,
view_mode, list_view, grid_view, ranking_view
```

---

## 🚧 CẦN REFACTOR TIẾP

### **Màn hình lớn cần refactor (ưu tiên cao)**

#### 1. **ConfigSystem.jsx** (1850 dòng)
**File**: `app/views/Management/GeneralSetting/ConfigSystem.jsx`

**Hardcoded text cần thay thế**:
```javascript
// Lines 14-76: inputFields object
"Thông tin giải đấu" → t("competition_info")
"Bộ môn" → t("sport_type")
"Thời gian bắt đầu" → t("start_time")
"Thời gian kết thúc" → t("end_time")
"Cài đặt chung" → t("general_settings")
"Thời gian tính điểm" → t("scoring_time")
"Thời gian thi đấu" → t("match_duration")
"Thời gian nghỉ" → t("rest_time")
"Thời gian hiệp phụ" → t("extra_time")
"Thời gian y tế" → t("medical_time")
"Khoảng điểm tuyệt đối" → t("absolute_score_gap")
"Cài đặt điểm số" → t("score_settings")
"Điểm đòn chân" → t("leg_kick_score")
"Điểm ngã" → t("fall_score")
"Điểm biên (trừ điểm)" → t("boundary_minus_score")
"Điểm biên (cộng điểm)" → t("boundary_plus_score")
```

**Cách refactor**:
```javascript
// 1. Import useTranslation
import { useTranslation } from 'react-i18next';

// 2. Trong component
const { t } = useTranslation();

// 3. Chuyển inputFields thành function
const getInputFields = () => ({
  [t("competition_info")]: [
    { name: "bo_mon", label: t("sport_type"), placeholder: t("enter_sport_type") },
    // ...
  ],
  [t("general_settings")]: [
    // ...
  ]
});

// 4. Sử dụng
const inputFields = getInputFields();
```

#### 2. **CompetitionManagement.jsx** (1914 dòng)
**File**: `app/views/Management/GeneralSetting/CompetitionManagement.jsx`

**Hardcoded text cần thay thế**:
- "Lỗi khi đọc file Excel" → `t("excel_read_error")`
- "Vui lòng kiểm tra lại file" → `t("please_check_file")`
- "Chọn file Excel" → `t("select_excel_file")`
- "Import dữ liệu" → `t("import_data")`
- "Xuất Excel" → `t("export_excel")`
- "Danh sách trận đấu" → `t("match_list")`
- "Tìm kiếm" → `t("search")`

#### 3. **Connect/index.jsx** (1057 dòng)
**File**: `app/views/Management/Connect/index.jsx`

**Hardcoded text cần thay thế**:
- "Quản lý kết nối" → `t("connection_management_title")`
- "Thiết bị đã kết nối" → `t("connected_devices")`
- "Phê duyệt" → `t("approve")`
- "Từ chối" → `t("reject")`
- "Ngắt kết nối" → `t("disconnect")`

#### 4. **UserGuide/index.jsx** (838 dòng) - Chưa hoàn chỉnh
**File**: `app/views/UserGuide/index.jsx`

**Đã refactor**: Tab names (5 tabs)
**Còn lại**: ~200+ hardcoded strings trong nội dung các tab

---

## 📝 TRANSLATION KEYS CẦN THÊM

Thêm vào `vi.json` và `en.json`:

```json
{
  "sport_type": "Bộ môn" / "Sport Type",
  "enter_sport_type": "Nhập bộ môn" / "Enter sport type",
  "start_time": "Thời gian bắt đầu" / "Start Time",
  "end_time": "Thời gian kết thúc" / "End Time",
  "scoring_time": "Thời gian tính điểm" / "Scoring Time",
  "match_duration": "Thời gian thi đấu" / "Match Duration",
  "rest_time": "Thời gian nghỉ" / "Rest Time",
  "extra_time": "Thời gian hiệp phụ" / "Extra Time",
  "medical_time": "Thời gian y tế" / "Medical Time",
  "absolute_score_gap": "Khoảng điểm tuyệt đối" / "Absolute Score Gap",
  "score_settings": "Cài đặt điểm số" / "Score Settings",
  "leg_kick_score": "Điểm đòn chân" / "Leg Kick Score",
  "fall_score": "Điểm ngã" / "Fall Score",
  "boundary_minus_score": "Điểm biên (trừ điểm)" / "Boundary (Minus)",
  "boundary_plus_score": "Điểm biên (cộng điểm)" / "Boundary (Plus)",
  "excel_read_error": "Lỗi khi đọc file Excel" / "Error reading Excel file",
  "please_check_file": "Vui lòng kiểm tra lại file" / "Please check the file",
  "select_excel_file": "Chọn file Excel" / "Select Excel File",
  "import_data": "Import dữ liệu" / "Import Data"
}
```

---

## 🎯 HƯỚNG DẪN REFACTOR TỪNG BƯỚC

### **Bước 1: Thêm translation keys**
```bash
# Mở file
vi app/config/language/vi.json
vi app/config/language/en.json

# Thêm keys mới vào cuối file (trước dấu })
```

### **Bước 2: Import useTranslation**
```javascript
import { useTranslation } from 'react-i18next';

// Trong component
const { t } = useTranslation();
```

### **Bước 3: Thay thế hardcoded text**
```javascript
// Trước:
<h1>Quản lý giải đấu</h1>

// Sau:
<h1>{t("competition_management_title")}</h1>
```

### **Bước 4: Xử lý object/array có hardcoded text**
```javascript
// Trước:
const tabs = [
  { id: 1, name: "Tổng quan" },
  { id: 2, name: "Cài đặt" }
];

// Sau:
const getTabs = () => [
  { id: 1, name: t("overview") },
  { id: 2, name: t("settings") }
];

const tabs = getTabs();
```

### **Bước 5: Test**
```bash
# Chạy app
npm run dev

# Chuyển đổi ngôn ngữ và kiểm tra
# Click vào Language Switcher ở bottom sidebar
```

---

## 🔥 QUICK REFACTOR SCRIPT

Để refactor nhanh, bạn có thể sử dụng pattern sau:

```javascript
// Template cho mọi màn hình
import { useTranslation } from 'react-i18next';

export default function YourComponent() {
  const { t } = useTranslation();

  // Chuyển static data thành function
  const getData = () => ({
    title: t("title_key"),
    description: t("description_key")
  });

  return (
    <div>
      <h1>{t("page_title")}</h1>
      {/* ... */}
    </div>
  );
}
```

---

## 📊 TIẾN ĐỘ TỔNG THỂ

| Màn hình | Dòng code | Trạng thái | % Hoàn thành |
|----------|-----------|------------|--------------|
| Dashboard | 370 | ✅ Done | 100% |
| NotFound | 165 | ✅ Done | 100% |
| AboutUs | 300 | ⚠️ Partial | 60% |
| LicenseActivation | 292 | ✅ Done | 100% |
| LicenseStatus | 200 | ✅ Done | 100% |
| UserGuide | 838 | ⚠️ Partial | 20% |
| UpdateManager | 518 | ⚠️ Partial | 10% |
| ConfigSystem | 1850 | ❌ Todo | 0% |
| CompetitionManagement | 1914 | ❌ Todo | 0% |
| Connect | 1057 | ❌ Todo | 0% |

**Tổng**: ~6,500 dòng code cần refactor
**Đã hoàn thành**: ~1,327 dòng (20%)
**Còn lại**: ~5,173 dòng (80%)

---

## 🚀 KHUYẾN NGHỊ

1. **Ưu tiên refactor theo thứ tự**:
   - ✅ Dashboard, NotFound, LicenseActivation (Done)
   - 🔄 AboutUs, UserGuide (Hoàn thiện)
   - 📋 ConfigSystem, CompetitionManagement, Connect (Màn hình lớn)

2. **Sử dụng Find & Replace**:
   - Tìm: `"Quản lý giải đấu"`
   - Thay: `{t("competition_management_title")}`

3. **Test thường xuyên**:
   - Sau mỗi 10-20 replacements, test lại app
   - Chuyển đổi ngôn ngữ để đảm bảo không có lỗi

4. **Commit từng phần**:
   - Commit sau khi refactor xong 1 màn hình
   - Message: `feat(i18n): refactor [ScreenName] to support multi-language`

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra console log có lỗi không
2. Đảm bảo translation key tồn tại trong cả `vi.json` và `en.json`
3. Kiểm tra syntax: `t("key")` không phải `t('key')` (dùng double quotes)
4. Reload app sau khi thêm translation keys mới

---

**Chúc bạn refactor thành công! 🎉**

