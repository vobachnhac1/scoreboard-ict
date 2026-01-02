# 🥋 Scoreboard ICT - Hệ thống chấm điểm Vovinam

Hệ thống chấm điểm thi đấu Vovinam hiện đại, được xây dựng trên nền tảng Electron + React.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Node](https://img.shields.io/badge/node-%3E%3D14.x-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)

---

## ✨ Tính năng chính

### 🎯 Chấm điểm thi đấu
- ✅ Chấm điểm theo hệ điểm 2, 3, 4
- ✅ Hỗ trợ nhiều giám định (3, 5, 7)
- ✅ Tính điểm tự động theo quy định
- ✅ Hiển thị điểm real-time

### ⏱️ Quản lý thời gian
- ✅ Đồng hồ đếm ngược với độ chính xác 0.1 giây
- ✅ Tự động chuyển hiệp
- ✅ Thời gian nghỉ giữa các hiệp
- ✅ Hiệp phụ (nếu cần)
- ✅ Thời gian y tế

### 📊 Quản lý trận đấu
- ✅ Nhắc nhở, cảnh cáo, truất quyền
- ✅ Lịch sử thao tác (action tracking)
- ✅ Hoàn tác (undo) thao tác
- ✅ **Kết thúc trận đấu và lưu kết quả** ⭐ NEW

### 🎨 Giao diện
- ✅ Responsive design
- ✅ Dark/Light mode
- ✅ Hiển thị logo giải đấu
- ✅ Banner thời gian nghỉ/tạm dừng
- ✅ Animations mượt mà

### 🔌 Backend API
- ✅ RESTful API với Express
- ✅ MySQL database
- ✅ Lưu kết quả trận đấu
- ✅ Lưu lịch sử từng hiệp
- ✅ Statistics và reports

---

## 🚀 Quick Start

### Yêu cầu:
- Node.js >= 14.x
- MySQL >= 5.7 hoặc MariaDB >= 10.3
- npm hoặc yarn

### Cài đặt nhanh (5 phút):

```bash
# 1. Clone repository
git clone <repository-url>
cd scoreboard-ict

# 2. Setup Backend
cd server
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin database
npm run migrate
npm run dev

# 3. Setup Frontend (terminal mới)
cd ..
npm install
npm run dev
```

**🎉 Done!** Mở `http://localhost:3000`

👉 Xem chi tiết: [QUICK_START.md](QUICK_START.md)

---

## 📁 Cấu trúc thư mục

```
scoreboard-ict/
├── app/                          # Frontend (React)
│   ├── assets/                   # Hình ảnh, fonts
│   ├── components/               # React components
│   ├── views/                    # Màn hình
│   │   └── ScoreBoard/
│   │       └── Vovinam.jsx       # Màn hình chấm điểm chính
│   ├── helpers/                  # Utilities
│   └── config/                   # Cấu hình
│
├── server/                       # Backend (Express + MySQL)
│   ├── config/                   # Database config
│   ├── routes/                   # API routes
│   │   └── matches.js            # Match endpoints
│   ├── migrations/               # Database migrations
│   ├── scripts/                  # Utility scripts
│   └── index.js                  # Server entry point
│
├── public/                       # Static files
├── exports/                      # Export files
│
├── QUICK_START.md                # Hướng dẫn nhanh
├── SETUP_GUIDE.md                # Hướng dẫn chi tiết
├── CHANGELOG_FINISH_MATCH.md     # Changelog tính năng mới
└── README.md                     # File này
```

---

## 🔧 Cấu hình

### Frontend:
```javascript
// app/config/config.js
export const API_URL = 'http://localhost:6789';
```

### Backend:
```env
# server/.env
PORT=6789
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=scoreboard_ict
```

---

## 📡 API Endpoints

### POST /api/matches/finish
Kết thúc trận đấu và lưu kết quả.

**Request:**
```json
{
  "match_id": "ABC123",
  "status": "FIN",
  "red_score": 15,
  "blue_score": 12,
  "winner": "red",
  "round_history": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã lưu kết quả trận đấu thành công"
}
```

👉 Xem chi tiết: [server/README.md](server/README.md)

---

## 🗄️ Database

### Bảng chính:
- **matches** - Thông tin trận đấu và kết quả
- **round_results** - Chi tiết từng hiệp
- **competitions** - Giải đấu
- **athletes** - Vận động viên

### Views:
- **v_match_results** - Kết quả trận đấu

### Stored Procedures:
- **sp_get_match_statistics** - Thống kê trận đấu

👉 Xem schema: [server/migrations/add_match_result_fields.sql](server/migrations/add_match_result_fields.sql)

---

## 🧪 Testing

### Test Backend:
```bash
cd server
npm run migrate
npm run dev

# Test API
curl http://localhost:6789/health
```

### Test Frontend:
```bash
npm run dev
# Mở http://localhost:3000
```

### Test Database:
```sql
SELECT * FROM v_match_results;
SELECT * FROM round_results;
```

---

## 📚 Documentation

- [QUICK_START.md](QUICK_START.md) - Hướng dẫn nhanh 5 phút
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Hướng dẫn setup chi tiết
- [CHANGELOG_FINISH_MATCH.md](CHANGELOG_FINISH_MATCH.md) - Tính năng kết thúc trận đấu
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Tóm tắt implementation
- [server/README.md](server/README.md) - Backend API documentation

---

## 🎯 Tính năng mới nhất

### ⭐ Finish Match Feature (2025-12-25)

**Tính năng:**
- ✅ Nút "KẾT THÚC" trên giao diện
- ✅ Confirm dialog với thông tin kết quả
- ✅ Lưu kết quả vào database
- ✅ Lưu lịch sử từng hiệp (round_history)
- ✅ API endpoint `/api/matches/finish`
- ✅ Database schema mới

**Xem chi tiết:** [CHANGELOG_FINISH_MATCH.md](CHANGELOG_FINISH_MATCH.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

[MIT License](LICENSE.md)

---

## 👥 Team

- **Developer**: Bình Tân ICT
- **Contact**: [Your Contact Info]

---

## 🙏 Acknowledgments

- Electron
- React
- Express
- MySQL
- TailwindCSS

---

**🥋 Chúc bạn thành công với hệ thống chấm điểm Vovinam!**