// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Migration: Thêm các cột notes, logs, round_history vào bảng competition_match_history
// const dbPath = path.join(__dirname, '../database.sqlite');
// const db = new sqlite3.Database(dbPath);

// console.log('🔄 Bắt đầu migration: Thêm cột notes, logs, round_history...');

// db.serialize(() => {
//     // Kiểm tra xem cột đã tồn tại chưa
//     db.all("PRAGMA table_info(competition_match_history)", (err, columns) => {
//         if (err) {
//             console.error('❌ Lỗi khi kiểm tra cấu trúc bảng:', err);
//             db.close();
//             return;
//         }

//         const columnNames = columns.map(col => col.name);
//         console.log('📋 Các cột hiện tại:', columnNames);

//         // Thêm cột notes nếu chưa có
//         if (!columnNames.includes('notes')) {
//             db.run('ALTER TABLE competition_match_history ADD COLUMN notes TEXT', (err) => {
//                 if (err) {
//                     console.error('❌ Lỗi khi thêm cột notes:', err);
//                 } else {
//                     console.log('✅ Đã thêm cột notes');
//                 }
//             });
//         } else {
//             console.log('⏭️  Cột notes đã tồn tại');
//         }

//         // Thêm cột logs nếu chưa có
//         if (!columnNames.includes('logs')) {
//             db.run('ALTER TABLE competition_match_history ADD COLUMN logs TEXT', (err) => {
//                 if (err) {
//                     console.error('❌ Lỗi khi thêm cột logs:', err);
//                 } else {
//                     console.log('✅ Đã thêm cột logs');
//                 }
//             });
//         } else {
//             console.log('⏭️  Cột logs đã tồn tại');
//         }

//         // Thêm cột round_history nếu chưa có
//         if (!columnNames.includes('round_history')) {
//             db.run('ALTER TABLE competition_match_history ADD COLUMN round_history TEXT', (err) => {
//                 if (err) {
//                     console.error('❌ Lỗi khi thêm cột round_history:', err);
//                 } else {
//                     console.log('✅ Đã thêm cột round_history');
//                 }
                
//                 // Đóng database sau khi hoàn thành
//                 setTimeout(() => {
//                     db.close((err) => {
//                         if (err) {
//                             console.error('❌ Lỗi khi đóng database:', err);
//                         } else {
//                             console.log('🎉 Migration hoàn thành!');
//                         }
//                     });
//                 }, 500);
//             });
//         } else {
//             console.log('⏭️  Cột round_history đã tồn tại');
            
//             // Đóng database
//             db.close((err) => {
//                 if (err) {
//                     console.error('❌ Lỗi khi đóng database:', err);
//                 } else {
//                     console.log('🎉 Migration hoàn thành!');
//                 }
//             });
//         }
//     });
// });

