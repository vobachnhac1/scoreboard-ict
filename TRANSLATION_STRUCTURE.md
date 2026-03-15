# 🗂️ Cấu Trúc Translation Keys Theo Namespace

## 📋 Tổng Quan

Thay vì sử dụng flat structure, chúng ta sẽ tổ chức translation keys theo namespace cho từng màn hình:

```javascript
// Trước (Flat):
{
  "competition_management": "Quản lý giải đấu",
  "add_athlete": "Thêm vận động viên",
  "scoreboard_title": "Bảng điểm"
}

// Sau (Namespace):
{
  "common": {
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa"
  },
  "competition": {
    "title": "Quản lý giải đấu",
    "add_athlete": "Thêm vận động viên",
    "import_excel": "Import Excel"
  },
  "scoreboard": {
    "doikhang": {
      "title": "Bảng điểm Đối kháng",
      "red_corner": "Góc đỏ",
      "blue_corner": "Góc xanh"
    },
    "quyen": {
      "title": "Bảng điểm Quyền",
      "technical_score": "Điểm kỹ thuật"
    }
  }
}
```

## 🎯 Namespace Structure

### 1. **common** - Các từ dùng chung
```javascript
common: {
  // Actions
  save, cancel, delete, edit, update, create, search, filter, sort,
  export, import, download, upload, print, preview, refresh, reload,
  
  // Status
  loading, error, success, warning, info,
  
  // Confirmation
  confirm, yes, no, ok,
  
  // Navigation
  back, next, previous, finish, close
}
```

### 2. **dashboard** - Màn hình Dashboard
```javascript
dashboard: {
  title, welcome_message,
  competition_management, config_management, connection_management,
  user_guide, about_us,
  featured_features, system_running, get_started
}
```

### 3. **competition** - Quản lý giải đấu
```javascript
competition: {
  title, list, detail, create, edit,
  import_excel, export_excel, import_athletes, import_matches,
  athlete_name, athlete_code, team_name, coach_name,
  match_list, match_code, match_status, match_time,
  bracket, draw_bracket, standings
}
```

### 4. **scoreboard** - Bảng điểm
```javascript
scoreboard: {
  common: {
    timer, start, stop, reset, pause, resume,
    red_corner, blue_corner, current_score, total_score,
    round_1, round_2, round_3, extra_round
  },
  doikhang: {
    title, red_athlete, blue_athlete,
    add_point, subtract_point, add_warning, add_penalty,
    knockout, technical_knockout, declare_winner
  },
  quyen: {
    title, technical_score, artistic_score, difficulty_score,
    referee_1, referee_2, referee_3, referee_4, referee_5,
    average_score, final_score
  },
  vonhac: {
    title, presentation_score, execution_score,
    music_sync, choreography
  }
}
```

### 5. **config** - Cấu hình hệ thống
```javascript
config: {
  title, general_settings, score_settings, display_settings,
  competition_info, sport_type, start_time, end_time,
  scoring_time, match_duration, rest_time, extra_time,
  referee_count, keyboard_mode, background_settings
}
```

### 6. **connection** - Quản lý kết nối
```javascript
connection: {
  title, connected_devices, device_name, device_type, device_status,
  approve, reject, disconnect, send_message,
  qr_code, room_code, create_room, join_room
}
```

### 7. **license** - Quản lý bản quyền
```javascript
license: {
  title, activation, management,
  enter_key, activate, activating, activation_success,
  valid, not_activated, expired, revoked
}
```

### 8. **user_guide** - Hướng dẫn sử dụng
```javascript
user_guide: {
  title, overview, setup, competition, scoring, connection,
  intro_content, features, import_excel, manage_matches
}
```

## 📝 Cách Sử Dụng

### Trong Component:

```javascript
import { useTranslation } from 'react-i18next';

function CompetitionManagement() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('competition.title')}</h1>
      <button>{t('competition.import_excel')}</button>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Trong Scoreboard:

```javascript
function BangDiemDoiKhang() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('scoreboard.doikhang.title')}</h1>
      <div>{t('scoreboard.common.red_corner')}</div>
      <button>{t('scoreboard.doikhang.add_point')}</button>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

## 🎨 Ưu Điểm

1. **Dễ quản lý**: Mỗi màn hình có namespace riêng
2. **Tránh conflict**: Không lo trùng tên keys
3. **Dễ tìm kiếm**: Biết ngay key thuộc màn hình nào
4. **Scalable**: Dễ thêm màn hình mới
5. **Clear structure**: Cấu trúc rõ ràng, dễ maintain

## 📊 File Structure

```
app/config/language/
├── vi.json (Structured with namespaces)
├── en.json (Structured with namespaces)
└── index.js (i18n config)
```


