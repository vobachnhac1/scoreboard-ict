# Scoreboard ICT - Backend API

Backend API cho hệ thống chấm điểm Vovinam.

## 📋 Yêu cầu

- Node.js >= 14.x
- MySQL >= 5.7 hoặc MariaDB >= 10.3
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd server
npm install
```

### 2. Cấu hình database

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
PORT=6789
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=scoreboard_ict
```

### 3. Tạo database

```sql
CREATE DATABASE scoreboard_ict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Chạy migration

```bash
npm run migrate
```

Migration sẽ tạo:
- Bảng `matches` với các trường kết quả
- Bảng `round_results` để lưu chi tiết từng hiệp
- View `v_match_results` để xem kết quả
- Stored procedure `sp_get_match_statistics`
- Indexes và triggers

### 5. Khởi động server

**Development mode (với nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:6789`

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
  "red_remind": 1,
  "blue_remind": 2,
  "red_warn": 0,
  "blue_warn": 1,
  "red_kick": 3,
  "blue_kick": 2,
  "winner": "red",
  "total_rounds": 3,
  "final_time": "00:05.3",
  "action_history": [...],
  "round_history": [
    {
      "round": 1,
      "red_score": 5,
      "blue_score": 4,
      "red_remind": 0,
      "blue_remind": 1,
      "red_warn": 0,
      "blue_warn": 0,
      "round_type": "MAIN",
      "status": "COMPLETED"
    }
  ],
  "finished_at": "2025-12-25T10:30:00.000Z"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đã lưu kết quả trận đấu thành công",
  "data": {
    "match_id": "ABC123",
    "status": "FIN",
    "winner": "red",
    "red_score": 15,
    "blue_score": 12,
    "updated_at": "2025-12-25T10:30:00.000Z"
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Match not found"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-25T10:30:00.000Z"
}
```

## 🗄️ Database Schema

### Table: matches

| Column | Type | Description |
|--------|------|-------------|
| match_id | VARCHAR(50) | ID trận đấu (PK) |
| status | VARCHAR(10) | PENDING, LIVE, FIN, CANCELLED |
| red_score | INT | Điểm số đỏ |
| blue_score | INT | Điểm số xanh |
| red_remind | INT | Số lần nhắc nhở đỏ |
| blue_remind | INT | Số lần nhắc nhở xanh |
| red_warn | INT | Số lần cảnh cáo đỏ |
| blue_warn | INT | Số lần cảnh cáo xanh |
| red_kick | INT | Số đòn chân đỏ |
| blue_kick | INT | Số đòn chân xanh |
| winner | VARCHAR(10) | red, blue, null |
| total_rounds | INT | Tổng số hiệp |
| final_time | VARCHAR(10) | Thời gian kết thúc |
| action_history | JSON | Lịch sử thao tác |
| round_history | JSON | Lịch sử từng hiệp |
| finished_at | DATETIME | Thời điểm kết thúc |

### Table: round_results

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto increment (PK) |
| match_id | VARCHAR(50) | ID trận đấu (FK) |
| round | INT | Số hiệp |
| red_score | INT | Điểm đỏ trong hiệp |
| blue_score | INT | Điểm xanh trong hiệp |
| round_type | VARCHAR(10) | MAIN, EXTRA |
| status | VARCHAR(10) | COMPLETED, CANCELLED |

## 🧪 Testing

### Test với curl:

```bash
curl -X POST http://localhost:6789/api/matches/finish \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": "TEST001",
    "status": "FIN",
    "red_score": 15,
    "blue_score": 12,
    "winner": "red"
  }'
```

### Test với Postman:

Import collection từ `postman/scoreboard-ict.json`

## 📝 Logs

Server logs sẽ hiển thị:
- Request method và path
- Database connection status
- Migration status
- Errors

## 🔒 Security

- Validate tất cả input
- Prevent SQL injection với prepared statements
- Check duplicate finish
- Error handling đầy đủ

## 🐛 Troubleshooting

### Lỗi kết nối database:

```
❌ Database connection failed: Access denied
```

**Giải pháp:** Kiểm tra lại thông tin trong file `.env`

### Lỗi migration:

```
❌ Migration failed: Table already exists
```

**Giải pháp:** Migration sử dụng `IF NOT EXISTS`, có thể chạy lại an toàn


