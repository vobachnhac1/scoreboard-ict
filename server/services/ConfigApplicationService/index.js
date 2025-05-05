// const sqlite3 = require('sqlite3').verbose();


// class ConfigApplicationService {
//     constructor() {
//         this.db = new sqlite3.Database('./database.sqlite');
//         this.db.serialize(() => {
//             this.db.run(`
//                 CREATE TABLE IF NOT EXISTS config_application (
//                     id INTEGER PRIMARY KEY AUTOINCREMENT,
//                     cau_hinh_lay_diem_thap BOOLEAN NOT NULL DEFAULT     1,
//                     thoi_gian_nhay_diem INTEGER NOT NULL DEFAULT 1000,
//                     thoi_gian_hiep INTEGER NOT NULL DEFAULT 90,
//                     thoi_gian_hiep_phu INTEGER NOT NULL DEFAULT 60,
//                     thoi_gian_nghi_giua_hiep INTEGER NOT NULL DEFAULT 30,
//                     thoi_gian_y_te INTEGER NOT NULL DEFAULT 120,
//                     so_hiep INTEGER NOT NULL DEFAULT 3,
//                     so_giam_dinh INTEGER NOT NULL DEFAULT 3
//                 )
//             `); 
//             this.db.run(`
//                 CREATE TABLE IF NOT EXISTS license (
//                     id INTEGER PRIMARY KEY AUTOINCREMENT,
//                     client_key TEXT UNIQUE NOT NULL,         -- Khóa client, không được trùng
//                     mac_address TEXT NOT NULL,               -- MAC Address
//                     random_code TEXT NOT NULL,               -- Mã random 10 ký tự
//                     valid_from TEXT NOT NULL DEFAULT (datetime('now')),  -- Thời gian bắt đầu
//                     valid_to TEXT NOT NULL                   -- Thời gian kết thúc
//                 )
//             `);
//             // this.db.run(`
//             //     INSERT INTO config_application (
//             //         cau_hinh_lay_diem_thap,
//             //         thoi_gian_nhay_diem,
//             //         thoi_gian_hiep,
//             //         thoi_gian_nghi_giua_hiep,
//             //         thoi_gian_y_te,
//             //         so_hiep,
//             //         so_giam_dinh
//             //     ) VALUES (
//             //         1,  -- true
//             //         1000,
//             //         90,
//             //         30,
//             //         120,
//             //         3,
//             //         3
//             //     )
//             // `);
//         });
//     }   

//     getAllConfig() {
//         return new Promise((resolve, reject) => {
//             this.db.all("SELECT * FROM config_application", [], (err, rows) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(rows);
//                 }
//             });
//         });
//     };

//     getConfigById(id) {
//         return new Promise((resolve, reject) => {
//             this.db.get("SELECT * FROM config_application WHERE id = ?", [id], (err, row) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(row);
//                 }
//             });
//         });
//     };

//     createConfig(config) {
//         return new Promise((resolve, reject) => {
//             this.db.run("INSERT INTO config_application (cau_hinh_lay_diem_thap, thoi_gian_nhay_diem, thoi_gian_nhay_diem, thoi_gian_hiep, thoi_gian_nghi_giua_hiep, thoi_gian_y_te, so_hiep, so_giam_dinh) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//                 [config.cau_hinh_lay_diem_thap, config.thoi_gian_nhay_diem, config.thoi_gian_hiep, config.thoi_gian_nghi_giua_hiep, config.thoi_gian_y_te, config.so_hiep, config.so_giam_dinh], 
//                 function(err) {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve({ id, ...config });
//                     }
//                 });
//         });
//     }    

//     updateConfig(id, config) {
//         return new Promise((resolve, reject) => {
//             this.db.run("UPDATE config_application SET cau_hinh_lay_diem_thap = ?, thoi_gian_nhay_diem = ?, thoi_gian_hiep = ?, thoi_gian_nghi_giua_hiep = ?, thoi_gian_y_te = ?, so_hiep = ?, so_giam_dinh = ? WHERE id = ?", 
//                 [config.cau_hinh_lay_diem_thap, config.thoi_gian_nhay_diem, config.thoi_gian_hiep, config.thoi_gian_nghi_giua_hiep, config.thoi_gian_y_te, config.so_hiep, config.so_giam_dinh, id], 
//                 function(err) {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve({ id, ...config });
//                     }
//                 });
//         });
//     };

//     deleteConfig(id) {
//         return new Promise((resolve, reject) => {
//             this.db.run("DELETE FROM config_application WHERE id = ?", [id], function(err) {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(this.changes > 0);
//                 }
//             });
//         });
//     };

//     close() {
//         this.db.close();
//     }
// }

// module.exports = ConfigApplicationService;