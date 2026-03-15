// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Đường dẫn đến database SQLite (root folder)
// const DB_PATH = path.join(__dirname, '../../database.sqlite');

// console.log('Database path:', DB_PATH);

// // Kết nối database
// const db = new sqlite3.Database(DB_PATH, (err) => {
//     if (err) {
//         console.error(' Lỗi kết nối database:', err.message);
//         process.exit(1);
//     }
//     console.log(' Đã kết nối database SQLite');
// });

// // Hàm kiểm tra cột có tồn tại không
// function checkColumnExists(tableName, columnName) {
//     return new Promise((resolve, reject) => {
//         db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 const exists = rows.some(row => row.name === columnName);
//                 resolve(exists);
//             }
//         });
//     });
// }

// // Hàm thêm cột mới
// function addColumn(tableName, columnName, columnType, defaultValue = null) {
//     return new Promise((resolve, reject) => {
//         let sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
//         if (defaultValue !== null) {
//             sql += ` DEFAULT ${defaultValue}`;
//         }
        
//         db.run(sql, (err) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve();
//             }
//         });
//     });
// }

// // Hàm migration chính
// async function runMigration() {
//     try {
//         console.log('\n🚀 Bắt đầu migration...\n');

//         // Migration 1: Thêm cột vào competition_match_history
//         const table1 = 'competition_match_history';
//         const columns1 = [
//             { name: 'notes', type: 'TEXT', default: null },
//             { name: 'logs', type: 'TEXT', default: null },
//             { name: 'round_history', type: 'TEXT', default: null }
//         ];

//         console.log(`📋 Migration cho bảng '${table1}':`);
//         for (const column of columns1) {
//             console.log(`🔍 Kiểm tra cột '${column.name}' trong bảng '${table1}'...`);
//             const exists = await checkColumnExists(table1, column.name);

//             if (exists) {
//                 console.log(`⏭️  Cột '${column.name}' đã tồn tại, bỏ qua.`);
//             } else {
//                 console.log(`➕ Thêm cột '${column.name}' vào bảng '${table1}'...`);
//                 await addColumn(table1, column.name, column.type, column.default);
//                 console.log(` Đã thêm cột '${column.name}' thành công!`);
//             }
//         }

//         // Migration 2: Thêm cột scores vào competition_match_team
//         const table2 = 'competition_match_team';
//         const columns2 = [
//             { name: 'scores', type: 'TEXT', default: null }
//         ];

//         console.log(`\n📋 Migration cho bảng '${table2}':`);
//         for (const column of columns2) {
//             console.log(`🔍 Kiểm tra cột '${column.name}' trong bảng '${table2}'...`);
//             const exists = await checkColumnExists(table2, column.name);

//             if (exists) {
//                 console.log(`⏭️  Cột '${column.name}' đã tồn tại, bỏ qua.`);
//             } else {
//                 console.log(`➕ Thêm cột '${column.name}' vào bảng '${table2}'...`);
//                 await addColumn(table2, column.name, column.type, column.default);
//                 console.log(` Đã thêm cột '${column.name}' thành công!`);
//             }
//         }

//         // Hiển thị cấu trúc các bảng sau khi migration
//         console.log(`\n Cấu trúc bảng '${table1}' sau migration:`);
//         db.all(`PRAGMA table_info(${table1})`, (err, rows) => {
//             if (err) {
//                 console.error(' Lỗi khi lấy thông tin bảng:', err.message);
//             } else {
//                 console.table(rows.map(row => ({
//                     ID: row.cid,
//                     Name: row.name,
//                     Type: row.type,
//                     NotNull: row.notnull ? 'YES' : 'NO',
//                     Default: row.dflt_value || 'NULL'
//                 })));
//             }

//             console.log(`\n Cấu trúc bảng '${table2}' sau migration:`);
//             db.all(`PRAGMA table_info(${table2})`, (err, rows) => {
//                 if (err) {
//                     console.error(' Lỗi khi lấy thông tin bảng:', err.message);
//                 } else {
//                     console.table(rows.map(row => ({
//                         ID: row.cid,
//                         Name: row.name,
//                         Type: row.type,
//                         NotNull: row.notnull ? 'YES' : 'NO',
//                         Default: row.dflt_value || 'NULL'
//                     })));
//                 }

//                 // Đóng kết nối
//                 db.close((err) => {
//                     if (err) {
//                         console.error(' Lỗi khi đóng database:', err.message);
//                     } else {
//                         console.log('\n👋 Đã đóng kết nối database');
//                         console.log(' Migration hoàn tất!\n');
//                     }
//                 });
//             });
//         });

//     } catch (error) {
//         console.error(' Migration thất bại:', error.message);
//         db.close();
//         process.exit(1);
//     }
// }

// // Chạy migration
// runMigration();

