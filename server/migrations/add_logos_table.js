// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// const DB_PATH = path.join(__dirname, '../database.sqlite');

// const db = new sqlite3.Database(DB_PATH, (err) => {
//   if (err) {
//     console.error('❌ Lỗi kết nối database:', err.message);
//     process.exit(1);
//   }
//   console.log('✅ Đã kết nối database');
// });

// // Migration: Tạo bảng logos
// db.serialize(() => {
//   console.log('🔄 Bắt đầu migration: Tạo bảng logos...');

//   // Kiểm tra xem bảng đã tồn tại chưa
//   db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='logos'", (err, row) => {
//     if (err) {
//       console.error('❌ Lỗi kiểm tra bảng:', err.message);
//       db.close();
//       process.exit(1);
//     }

//     if (row) {
//       console.log('⚠️  Bảng logos đã tồn tại, bỏ qua migration');
//       db.close();
//       process.exit(0);
//     }

//     // Tạo bảng logos
//     db.run(`
//       CREATE TABLE IF NOT EXISTS logos (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         url TEXT NOT NULL,
//         position INTEGER DEFAULT 0,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       )
//     `, (err) => {
//       if (err) {
//         console.error('❌ Lỗi tạo bảng logos:', err.message);
//         db.close();
//         process.exit(1);
//       }

//       console.log('✅ Đã tạo bảng logos thành công');

//       // Thêm một số logos mẫu
//       const sampleLogos = [
//         { url: 'https://vovinambinhtan.com/upload/hinhanh/logovovi-1486.png', position: 0 },
//         { url: 'https://vovinambinhtan.com/upload/hinhanh/logovovi-1486.png', position: 1 },
//         { url: 'https://vovinambinhtan.com/upload/hinhanh/logovovi-1486.png', position: 2 }
//       ];

//       const stmt = db.prepare('INSERT INTO logos (url, position) VALUES (?, ?)');
      
//       sampleLogos.forEach((logo) => {
//         stmt.run(logo.url, logo.posit ion);
//       });

//       stmt.finalize((err) => {
//         if (err) {
//           console.error('❌ Lỗi thêm dữ liệu mẫu:', err.message);
//         } else {
//           console.log('✅ Đã thêm dữ liệu mẫu thành công');
//         }

//         db.close((err) => {
//           if (err) {
//             console.error('❌ Lỗi đóng database:', err.message);
//             process.exit(1);
//           }
//           console.log('✅ Migration hoàn tất');
//           process.exit(0);
//         });
//       });
//     });
//   });
// });

