// /**
//  * Migration Script: Thêm các trường thông tin giải đấu vào config_values
//  * 
//  * Chạy script này để cập nhật database cho các user hiện tại
//  * 
//  * Cách chạy:
//  * node server/migrations/add_tournament_info_fields.js
//  */

// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Đường dẫn đến database
// const DB_PATH = path.join(__dirname, '../database/scoreboard.db');

// const db = new sqlite3.Database(DB_PATH, (err) => {
//     if (err) {
//         console.error(' Lỗi kết nối database:', err.message);
//         process.exit(1);
//     }
//     console.log(' Đã kết nối database:', DB_PATH);
// });

// // Các trường mới cần thêm
// const newFields = [
//     // Thông tin giải đấu
//     { key: 'system', child_key: 'ten_giai_dau', value: 'Giải Vô địch Vovinam Toàn quốc 2025' },
//     { key: 'system', child_key: 'bo_mon', value: 'Vovinam' },
//     { key: 'system', child_key: 'thoi_gian_bat_dau', value: '2025-01-15' },
//     { key: 'system', child_key: 'thoi_gian_ket_thuc', value: '2025-01-20' },
//     { key: 'system', child_key: 'mo_ta_giai_dau', value: 'Giải đấu quy tụ các võ sĩ xuất sắc nhất cả nước' },
// ];

// // Hàm kiểm tra field đã tồn tại chưa
// function checkFieldExists(child_key) {
//     return new Promise((resolve, reject) => {
//         db.get(
//             "SELECT * FROM config_values WHERE key = 'system' AND child_key = ?",
//             [child_key],
//             (err, row) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(row !== undefined);
//                 }
//             }
//         );
//     });
// }

// // Hàm thêm field mới
// function insertField(field) {
//     return new Promise((resolve, reject) => {
//         db.run(
//             "INSERT INTO config_values (key, child_key, value) VALUES (?, ?, ?)",
//             [field.key, field.child_key, field.value],
//             function(err) {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(this.lastID);
//                 }
//             }
//         );
//     });
// }

// // Main migration function
// async function migrate() {
//     console.log('\n🚀 Bắt đầu migration...\n');
    
//     let addedCount = 0;
//     let skippedCount = 0;
    
//     for (const field of newFields) {
//         try {
//             const exists = await checkFieldExists(field.child_key);
            
//             if (exists) {
//                 console.log(`⏭️  Bỏ qua: ${field.child_key} (đã tồn tại)`);
//                 skippedCount++;
//             } else {
//                 await insertField(field);
//                 console.log(` Đã thêm: ${field.child_key} = "${field.value}"`);
//                 addedCount++;
//             }
//         } catch (error) {
//             console.error(` Lỗi khi xử lý ${field.child_key}:`, error.message);
//         }
//     }
    
//     console.log('\n Kết quả migration:');
//     console.log(`   - Đã thêm mới: ${addedCount} fields`);
//     console.log(`   - Đã bỏ qua: ${skippedCount} fields`);
//     console.log('\n✨ Migration hoàn tất!\n');
    
//     // Đóng database connection
//     db.close((err) => {
//         if (err) {
//             console.error(' Lỗi khi đóng database:', err.message);
//         } else {
//             console.log(' Đã đóng kết nối database\n');
//         }
//     });
// }

// // Chạy migration
// migrate().catch(err => {
//     console.error(' Migration thất bại:', err);
//     process.exit(1);
// });

